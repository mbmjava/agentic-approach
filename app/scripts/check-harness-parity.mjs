#!/usr/bin/env node
// Harness parity check: OpenCode and Claude Code should expose the same agents, skills, and commands.
//
//   node scripts/check-harness-parity.mjs
//
// WHY: if one harness gains an agent, skill, or slash command the other lacks, the workflows silently
// diverge. This fails CI when the sets differ. (Model *values* are checked separately by
// scripts/sync-agent-models.mjs.)
import { readdirSync, existsSync, statSync } from 'node:fs';

const problems = [];
const list = (dir, kind) => {
  if (!existsSync(dir)) return null;
  const entries = readdirSync(dir);
  return kind === 'file'
    ? entries.filter((n) => n.endsWith('.md') && statSync(`${dir}/${n}`).isFile()).map((n) => n.slice(0, -3))
    : entries.filter((n) => statSync(`${dir}/${n}`).isDirectory());
};
const compare = (label, ocDir, clDir, kind) => {
  const oc = list(ocDir, kind);
  const cl = list(clDir, kind);
  if (oc === null || cl === null) { console.log(`${label}: one harness absent — skipped`); return; }
  const ocSet = new Set(oc);
  const clSet = new Set(cl);
  for (const n of ocSet) if (!clSet.has(n)) problems.push(`${label}: present in .opencode but missing in .claude -> '${n}'`);
  for (const n of clSet) if (!ocSet.has(n)) problems.push(`${label}: present in .claude but missing in .opencode -> '${n}'`);
  console.log(`${label}: ${ocSet.size} opencode / ${clSet.size} claude`);
};

compare('agents', '.opencode/agents', '.claude/agents', 'file');
compare('skills', '.opencode/skills', '.claude/skills', 'dir');
compare('commands', '.opencode/commands', '.claude/commands', 'file');

if (problems.length) {
  for (const p of problems) console.error(`  ✗ ${p}`);
  console.error(`check-harness-parity: ${problems.length} problem(s)`);
  process.exit(1);
}
console.log('check-harness-parity: OK');
