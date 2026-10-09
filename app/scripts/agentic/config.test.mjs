import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from './config.mjs';

test('repo config identifies its trusted branch and has no implicit judge target or mode default', () => {
  const config = loadConfig();
  assert.equal(config.rollupBranch, 'main');
  assert.equal(config.forge.provider, 'github');
  assert.deepEqual(config.judgeMergeTargets, []);
  assert.equal('approval' in config, false);
  assert.equal('model' in config.labels, false);
  assert.equal('human' in config.labels, false);
});
