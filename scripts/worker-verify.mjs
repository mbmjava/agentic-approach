#!/usr/bin/env node
// Bounded self-verification wrapper for workers.
//
// Why it exists: a worker's shell allowlist permits only `node scripts/*` wrappers (prefix
// patterns that reliably match), never a raw `mvnw`, docker or the app. This wrapper compiles a
// module and optionally runs one focused unit test, with a hard timeout so a stalled build FAILS
// instead of hanging the worker.
//
//   node scripts/worker-verify.mjs <module> [TestClass]
//
//     <module>     Maven module id, e.g. app
//     [TestClass]  focused surefire test class, e.g. WellSearchAgentTest (omit to just compile)
//
// One build at a time — the orchestrator serializes build-capable workers (target/ + ports are shared).
import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [module, testClass] = process.argv.slice(2);
if (!module) {
  console.error('usage: node scripts/worker-verify.mjs <module> [TestClass]');
  process.exit(2);
}

const wrapper = resolve(ROOT, process.platform === 'win32' ? 'mvnw.cmd' : 'mvnw');
const goals = testClass ? ['test', `-Dtest=${testClass}`] : ['test-compile'];
const args = ['-pl', module, ...goals];
console.log(`worker-verify: ${module} ${goals.join(' ')}`);

// Single quoted command string + shell:true (Node's own recommendation; mirrors run-it.mjs).
const quoteArg = (s) => (/[\s"]/.test(s) ? `"${String(s).replace(/"/g, '\\"')}"` : s);
const commandLine = [wrapper, ...args].map(quoteArg).join(' ');
const child = spawn(commandLine, { cwd: ROOT, shell: true, stdio: 'inherit' });
const timer = setTimeout(() => {
  try { child.kill(); } catch { /* already gone */ }
  console.error('\nworker-verify: no completion within 300s — stopped');
  process.exit(1);
}, 300_000);

child.on('close', (code) => {
  clearTimeout(timer);
  process.exit(code ?? 1);
});
