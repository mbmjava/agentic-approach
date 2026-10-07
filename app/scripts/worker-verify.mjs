#!/usr/bin/env node
// Bounded self-verification wrapper for workers.
//
// Workers are permitted to invoke this wrapper only as the exact no-argument command below; never
// run raw `mvnw`, docker, or the app. The optional test-class argument is for orchestrator use only.
// A hard timeout makes a stalled build FAIL instead of hanging the session.
//
//   node scripts/worker-verify.mjs [TestClass]
//
//     [TestClass]  focused surefire test class (omit to run the full test phase)
//
// One build at a time — the orchestrator serializes build-capable workers (target/ and ports are shared).
import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [testClass] = process.argv.slice(2);

const wrapper = resolve(ROOT, process.platform === 'win32' ? 'mvnw.cmd' : 'mvnw');
const goals = testClass ? ['test', `-Dtest=${testClass}`] : ['test'];
const args = [...goals];
console.log(`worker-verify: ${goals.join(' ')}`);

// Single quoted command string; shell:true is required to invoke the Windows .cmd wrapper.
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
