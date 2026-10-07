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
// or 0 to allow. Missing, malformed, or unexpected hook input fails closed.
import { readFileSync } from 'node:fs';

const tier = process.argv[2];

const block = (why) => {
  process.stderr.write(`Blocked by worker-shell-guard (${tier}): ${why}\n` +
    `Allowed: exact bounded wrappers (check-docs${tier === 'worker' ? '/worker-verify' : ''}) ` +
    'and exact read-only git commands.\n');
  process.exit(2);
};

if (tier !== 'worker' && tier !== 'xs') block('expected tier `worker` or `xs`');

let input;
try {
  input = readFileSync(0, 'utf8');
} catch {
  block('cannot read hook input');
}

let payload;
try {
  payload = JSON.parse(input);
} catch {
  block('invalid hook JSON');
}

const command = payload?.tool_input?.command;
if (typeof command !== 'string') block('hook payload has no string command');
const cmd = command.trim();

// Exact matching rejects added arguments, chaining, redirection, and process substitution.
const allowed = [
  'node scripts/check-docs.mjs',
  'git status --short',
  'git diff',
  'git diff --check',
  'git log --oneline -10',
];
if (tier === 'worker') {
  allowed.push('node scripts/worker-verify.mjs');
}

if (allowed.includes(cmd)) process.exit(0);
block(`command is not an exact allowlisted invocation: '${cmd}'`);
