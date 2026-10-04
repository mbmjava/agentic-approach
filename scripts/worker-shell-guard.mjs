#!/usr/bin/env node
// Worker shell guard — the Claude Code equivalent of OpenCode's worker `shell` allowlist.
//
//   Wired as a PreToolUse hook on the Bash tool in .claude/agents/worker.md and worker-xs.md:
//     hooks:
//       PreToolUse:
//         - matcher: "Bash"
//           hooks:
//             - type: command
//               command: "node scripts/worker-shell-guard.mjs worker"   # or: xs
//
// Reads the hook JSON on stdin and exits 2 to BLOCK a command (stderr is returned to the model),
// or 0 to allow. Workers may run ONLY the bounded wrappers and read-only git; everything else is
// blocked, so "bounded commands only" and "no git writes" are enforced, not just instructed.
import { readFileSync } from 'node:fs';

const tier = process.argv[2] === 'xs' ? 'xs' : 'worker';

let input = '';
try { input = readFileSync(0, 'utf8'); } catch { /* no stdin */ }

let command = '';
try {
  const json = JSON.parse(input);
  command = json?.tool_input?.command ?? '';
} catch {
  process.exit(0); // fail-open if the hook payload isn't what we expect
}
if (typeof command !== 'string') process.exit(0);
const cmd = command.trim();

const block = (why) => {
  process.stderr.write(`Blocked by worker-shell-guard (${tier}): ${why}\n` +
    `Allowed: the bounded wrappers (worker-verify/check-docs/code-map${tier === 'worker' ? '/run-it' : ''}) ` +
    `and read-only git (status/diff/log). One simple command, exactly as written.\n`);
  process.exit(2);
};

// No pipelines, chaining, substitution, or newlines — run one command exactly as written.
if (/[;&|`\n]|\$\(/.test(cmd)) block(`compound or piped command not allowed: '${cmd}'`);

const allowed = [
  /^node\s+scripts\/check-docs\.mjs\b/,
  /^node\s+scripts\/code-map\.mjs\b/,
  /^git\s+(status|diff|log)\b/,
];
if (tier === 'worker') {
  allowed.push(/^node\s+scripts\/worker-verify\.mjs\b/);
  allowed.push(/^node\s+scripts\/run-it\.mjs\b/);
}

if (allowed.some((re) => re.test(cmd))) process.exit(0);
block(`command not on the worker allowlist: '${cmd}'`);
