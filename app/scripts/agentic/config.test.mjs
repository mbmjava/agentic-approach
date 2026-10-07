import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from './config.mjs';
import { resolveAuthority } from './authority.mjs';

test('repo config exposes the rollup branch and model-default authority', () => {
  const config = loadConfig();
  assert.equal(config.rollupBranch, 'main');
  assert.equal(config.approval.default, 'model');
  assert.equal(config.forge.provider, 'github');
});

test("the loop's own definition and governance files require human authority", () => {
  const config = loadConfig();
  const guarded = [
    '.opencode/agents/judge.md',
    '.claude/agents/judge.md',
    '.opencode/models.json',
    '.agentic/config.json',
    'scripts/agentic/decide.mjs',
    'AGENTS.md',
    'CLAUDE.md',
    'docs/standards/review-checklist.md',
    'working-docs/agent-standards.md',
  ];
  for (const file of guarded) {
    assert.equal(resolveAuthority({ config, changedFiles: [file] }).authority, 'human', file);
  }
});
