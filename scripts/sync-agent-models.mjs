#!/usr/bin/env node
// Single source of truth for agent models, across harnesses.
//
//   node scripts/sync-agent-models.mjs          # write each agent's `model:` from .opencode/models.json
//   node scripts/sync-agent-models.mjs --check  # fail if any agent file drifts (CI)
//
// WHY: both OpenCode (`.opencode/agents/*.md`) and Claude Code (`.claude/agents/*.md`) read an
// agent's `model:` literally — there is no property/variable substitution in frontmatter. Rather than
// let the same model be edited in several files, define each role once in `.opencode/models.json`
// with a value per CLI, and sync/verify from there. The agent *body* is shared; only frontmatter differs.
//
// The source maps a model property to a value per CLI, and an agent to its property:
//   { "models": { "reviewer": { "opencode": "openrouter/openai/gpt-6-luna", "claude": "sonnet" } },
//     "agents": { "pr-reviewer": "reviewer" } }
// A plain string value is still accepted (applied to every CLI).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const SRC = '.opencode/models.json';
const CHECK = process.argv.includes('--check');
const CLI_DIRS = { opencode: '.opencode/agents', claude: '.claude/agents' };

if (!existsSync(SRC)) { console.error(`${SRC}: missing`); process.exit(1); }
const cfg = JSON.parse(readFileSync(SRC, 'utf8'));

let problems = 0;
let changed = 0;

for (const [agent, prop] of Object.entries(cfg.agents)) {
  const val = cfg.models[prop];
  if (!val) { console.error(`${agent}: unknown model property '${prop}'`); problems++; continue; }

  for (const [cli, dir] of Object.entries(CLI_DIRS)) {
    // A harness that isn't present in this project is simply skipped.
    if (!existsSync(dir)) continue;
    const model = typeof val === 'string' ? val : val[cli];
    if (!model) continue; // no value configured for this CLI

    const file = `${dir}/${agent}.md`;
    if (!existsSync(file)) continue; // agent not defined for this harness

    const md = readFileSync(file, 'utf8');
    const fm = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fm) { console.error(`${file}: no frontmatter`); problems++; continue; }

    const body = fm[1];
    let next;
    if (/^model:.*$/m.test(body)) next = body.replace(/^model:.*$/m, `model: ${model}`);
    else if (/^(description:.*)$/m.test(body)) next = body.replace(/^(description:.*)$/m, `$1\nmodel: ${model}`);
    else { console.error(`${file}: no 'model:' or 'description:' line to anchor to`); problems++; continue; }

    const out = md.replace(body, next);
    if (out === md) continue;

    if (CHECK) {
      console.error(`${file}: model drift — expected 'model: ${model}'`);
      problems++;
    } else {
      writeFileSync(file, out);
      changed++;
      console.log(`${file}: set model ${model}`);
    }
  }
}

if (CHECK) {
  if (problems) { console.error(`sync-agent-models: ${problems} problem(s)`); process.exit(1); }
  console.log('sync-agent-models: OK');
} else {
  console.log(`sync-agent-models: ${changed} file(s) updated`);
}
