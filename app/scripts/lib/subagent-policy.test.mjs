import test from 'node:test';
import assert from 'node:assert/strict';
import {
  completedBeforeDeadline,
  loadSubagentPolicy,
  resolveConfiguredModel,
} from './subagent-policy.mjs';

const policy = loadSubagentPolicy();

test('resolves configured Claude model aliases for every approved role', () => {
  assert.equal(resolveConfiguredModel(policy, 'worker', 'claude'), 'haiku');
  assert.equal(resolveConfiguredModel(policy, 'worker-xs', 'claude'), 'haiku');
  assert.equal(resolveConfiguredModel(policy, 'architecture-reviewer', 'claude'), 'sonnet');
  assert.equal(resolveConfiguredModel(policy, 'pr-reviewer', 'claude'), 'sonnet');
});

test('rejects child completions at or after the fixed deadline', () => {
  assert.equal(completedBeforeDeadline(999, 1000), true);
  assert.equal(completedBeforeDeadline(1000, 1000), false);
  assert.equal(completedBeforeDeadline(null, 1000), false);
});
