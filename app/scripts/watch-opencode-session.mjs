#!/usr/bin/env node
// Supervise one visible native OpenCode subagent: wall-clock deadline + stop. No token accounting.
// The child is launched with the native background-subagent tool; this watches the exact child
// session, interrupts it at the deadline, and confirms terminal state.
// Usage: node scripts/watch-opencode-session.mjs <child-id> <role> [minutes]
import { spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';
import { completedBeforeDeadline, loadSubagentPolicy, resolveDeadlineMs } from './lib/subagent-policy.mjs';

const SESSION_ID = /^ses[A-Za-z0-9_-]+$/;
const TERMINAL = new Set(['succeeded', 'failed', 'interrupted']);
const POLL_MS = 5_000;

function emit(event) {
  process.stdout.write(`${JSON.stringify({ at: new Date().toISOString(), ...event })}\n`);
}

function invokeApi(method, apiPath) {
  if (!['get', 'post'].includes(method) || !/^\/api\/[A-Za-z0-9/_?=&.-]+$/.test(apiPath)) {
    throw new Error('Invalid OpenCode API request');
  }
  const result = process.platform === 'win32'
    ? spawnSync(`opencode.cmd api ${method} "${apiPath}"`, {
      cwd: process.cwd(), shell: true, windowsHide: true, encoding: 'utf8', timeout: 10_000,
      maxBuffer: 16 * 1024 * 1024,
    })
    : spawnSync('opencode', ['api', method, apiPath], {
      cwd: process.cwd(), encoding: 'utf8', timeout: 10_000, maxBuffer: 16 * 1024 * 1024,
    });
  if (result.error) throw new Error(`OpenCode API client failed: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`OpenCode API ${method} failed`);
  try {
    return JSON.parse(result.stdout.trim());
  } catch {
    throw new Error(`OpenCode API ${method} returned invalid JSON`);
  }
}

function getSession(id) {
  const response = invokeApi('get', `/api/session/${id}`);
  if (response.data?.id !== id) throw new Error('Child session not found');
  return response.data;
}

async function stopAndConfirm(childId, role, reason, graceMs) {
  emit({ event: 'stop-requested', childId, role, reason });
  try {
    invokeApi('post', `/api/session/${childId}/interrupt?resume=false`);
  } catch {
    emit({ event: 'stop-request-error', childId, role, reason });
  }
  const deadline = Date.now() + graceMs;
  while (Date.now() <= deadline) {
    try {
      const session = getSession(childId);
      if (TERMINAL.has(session.outcome)) {
        emit({ event: 'stop-confirmed', childId, role, outcome: session.outcome, reason });
        return true;
      }
    } catch {
      emit({ event: 'stop-status-unavailable', childId, role, reason });
    }
    await delay(Math.min(POLL_MS, Math.max(0, deadline - Date.now())));
  }
  emit({ event: 'stop-unconfirmed', childId, role, reason });
  return false;
}

async function supervise(childId, role, minutes, root = process.cwd()) {
  if (!SESSION_ID.test(childId)) throw new Error('Invalid OpenCode child session ID');
  const config = loadSubagentPolicy(root);
  const deadlineMs = resolveDeadlineMs(config, minutes);
  const graceMs = config.timeouts.stopConfirmationMs;
  let child = getSession(childId);
  if (!child.parentID || child.agent !== role) {
    await stopAndConfirm(childId, role, 'child-correlation-mismatch', graceMs);
    throw new Error('Child session does not match the requested parent role');
  }
  const startedAt = Number(child.time?.created);
  if (!Number.isFinite(startedAt) || startedAt <= 0) {
    await stopAndConfirm(childId, role, 'launch-time-unavailable', graceMs);
    throw new Error('Child launch time is unavailable');
  }
  const deadline = startedAt + deadlineMs;
  emit({ event: 'watching', childId, role, deadline });

  while (true) {
    child = getSession(childId);
    const now = Date.now();
    const terminal = TERMINAL.has(child.outcome);
    if (!terminal && now >= deadline) {
      await stopAndConfirm(childId, role, 'elapsed-deadline', graceMs);
      emit({ event: 'result-rejected', childId, role, reason: 'elapsed-deadline' });
      process.exitCode = 4;
      return;
    }
    if (terminal) {
      if (!completedBeforeDeadline(Number(child.time?.updated), deadline)) {
        emit({ event: 'result-rejected', childId, role, reason: 'elapsed-deadline', outcome: child.outcome });
        process.exitCode = 4;
        return;
      }
      if (child.outcome !== 'succeeded') {
        emit({ event: 'result-rejected', childId, role, reason: 'terminal-non-success', outcome: child.outcome });
        process.exitCode = 4;
        return;
      }
      emit({ event: 'accepted', childId, role, outcome: child.outcome });
      return;
    }
    emit({ event: 'status', childId, role, outcome: child.outcome ?? null,
      remainingMs: Math.max(0, deadline - now) });
    await delay(Math.min(POLL_MS, Math.max(0, deadline - now)));
  }
}

async function main(argv = process.argv.slice(2)) {
  const [childId, role, minutes] = argv;
  if (!childId || !role) {
    console.error('Usage: node scripts/watch-opencode-session.mjs <child-id> <role> [minutes]');
    process.exitCode = 2;
    return;
  }
  try {
    await supervise(childId, role, minutes);
  } catch (error) {
    emit({ event: 'fail-closed', childId, role, reason: error.message });
    process.exitCode = process.exitCode || 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();

export { supervise };
