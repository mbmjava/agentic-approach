import test from 'node:test';
import assert from 'node:assert/strict';
import {
  loadSubagentPolicy,
  resolveConfiguredModel,
  resolveDeadlineMs,
} from './lib/subagent-policy.mjs';

const policy = loadSubagentPolicy();

test('uses a single default deadline with a per-run minute override', () => {
  assert.equal(resolveDeadlineMs(policy), policy.timeouts.defaultMs);
  assert.equal(resolveDeadlineMs(policy, '5'), 300_000);
  assert.throws(() => resolveDeadlineMs(policy, '0'), /Invalid/);
  assert.throws(() => resolveDeadlineMs(policy, 'abc'), /Invalid/);
});

test('resolves all approved OpenCode roles through the shared model mapping', () => {
  assert.equal(resolveConfiguredModel(policy, 'worker', 'opencode'), 'openrouter/poolside/laguna-s-2.1');
  assert.equal(resolveConfiguredModel(policy, 'worker-xs', 'opencode'), 'openrouter/poolside/laguna-xs-2.1');
  assert.equal(resolveConfiguredModel(policy, 'architecture-reviewer', 'opencode'), 'openrouter/openai/gpt-6-luna');
  assert.equal(resolveConfiguredModel(policy, 'pr-reviewer', 'opencode'), 'openrouter/openai/gpt-6-luna');
});
