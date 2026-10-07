import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const guard = fileURLToPath(new URL('./worker-shell-guard.mjs', import.meta.url));

function run(tier, input) {
  return spawnSync(process.execPath, [guard, tier], { input, encoding: 'utf8' });
}

function hook(command) {
  return JSON.stringify({ tool_input: { command } });
}

test('allows only the exact commands for each worker tier', () => {
  const readOnlyGit = [
    'git status --short',
    'git diff',
    'git diff --check',
    'git log --oneline -10',
  ];
  for (const tier of ['worker', 'xs']) {
    for (const command of ['node scripts/check-docs.mjs', ...readOnlyGit]) {
      assert.equal(run(tier, hook(command)).status, 0, `${tier} should allow ${command}`);
    }
  }
  assert.equal(run('worker', hook('node scripts/worker-verify.mjs')).status, 0);
  assert.equal(run('xs', hook('node scripts/worker-verify.mjs')).status, 2);
});

test('blocks extra arguments, unknown scripts, shell composition, and git writes', () => {
  const denied = [
    'node scripts/check-docs.mjs --fix',
    'node scripts/worker-verify.mjs GreetingControllerTest',
    'node scripts/code-map.mjs',
    'node scripts/run-it.mjs app GreetingControllerTest',
    'git status',
    'git add .',
    'node scripts/check-docs.mjs && git status --short',
  ];
  for (const command of denied) {
    assert.equal(run('worker', hook(command)).status, 2, `should block ${command}`);
  }
});

test('fails closed for malformed or incomplete hook input', () => {
  for (const input of ['', '{', '{}', hook(undefined), hook(42)]) {
    assert.equal(run('worker', input).status, 2);
  }
  assert.equal(run('other', hook('node scripts/check-docs.mjs')).status, 2);
});
