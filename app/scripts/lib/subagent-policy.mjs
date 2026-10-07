import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function positiveInteger(value, name) {
  if (!Number.isSafeInteger(value) || value <= 0) throw new Error(`${name} must be a positive integer`);
  return value;
}

// Shared config for bounded, visible subagents: model routing plus a single wall-clock
// deadline and a stop-confirmation window. No token accounting.
export function loadSubagentPolicy(root = process.cwd()) {
  const file = resolve(root, '.opencode/models.json');
  const config = JSON.parse(readFileSync(file, 'utf8'));
  if (!config.models || !config.agents || !config.timeouts) {
    throw new Error(`${file}: models, agents, and timeouts are required`);
  }
  positiveInteger(config.timeouts.defaultMs, 'timeouts.defaultMs');
  positiveInteger(config.timeouts.stopConfirmationMs, 'timeouts.stopConfirmationMs');
  return config;
}

export function resolveDeadlineMs(config, minutes) {
  if (minutes == null || minutes === '') return config.timeouts.defaultMs;
  const parsed = Number(minutes);
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error(`Invalid deadline minutes: ${minutes}`);
  return Math.round(parsed * 60_000);
}

export function resolveConfiguredModel(config, role, harness) {
  const modelKey = config.agents[role];
  if (!modelKey || !Object.hasOwn(config.models, modelKey)) {
    throw new Error(`No configured model mapping for subagent role '${role}'`);
  }
  const entry = config.models[modelKey];
  const model = typeof entry === 'string' ? entry : entry[harness];
  if (typeof model !== 'string' || model.length === 0) {
    throw new Error(`No ${harness} model configured for subagent role '${role}'`);
  }
  return model;
}

export function completedBeforeDeadline(completedAt, deadline) {
  return Number.isFinite(completedAt) && Number.isFinite(deadline) && completedAt < deadline;
}
