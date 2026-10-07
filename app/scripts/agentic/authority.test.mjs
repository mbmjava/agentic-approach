import test from 'node:test';
import assert from 'node:assert/strict';
import { globToRegExp, resolveAuthority } from './authority.mjs';

const config = {
  approval: { default: 'model' },
  labels: { model: 'approve:model', human: 'approve:human', hold: 'approve:hold' },
  riskPaths: ['**/security/**', '**/pom.xml', '.github/workflows/**'],
};

test('glob: ** spans directories, * does not', () => {
  assert.equal(globToRegExp('**/security/**').test('a/b/security/C.java'), true);
  assert.equal(globToRegExp('**/security/**').test('security/C.java'), true);
  assert.equal(globToRegExp('**/security/**').test('a/securityx/C.java'), false);
  assert.equal(globToRegExp('**/pom.xml').test('pom.xml'), true);
  assert.equal(globToRegExp('**/pom.xml').test('mod/pom.xml'), true);
  assert.equal(globToRegExp('.github/workflows/**').test('.github/workflows/ci.yml'), true);
  assert.equal(globToRegExp('.github/workflows/**').test('.github/ci.yml'), false);
});

test('defaults to model when nothing overrides', () => {
  assert.deepEqual(resolveAuthority({ config, labels: [], changedFiles: ['src/a.ts'] }),
    { authority: 'model', reason: 'default' });
});

test('hold forces human above all', () => {
  const r = resolveAuthority({ config, labels: ['approve:model', 'approve:hold'], changedFiles: ['src/a.ts'] });
  assert.equal(r.authority, 'human');
  assert.equal(r.reason, 'hold');
});

test('a risk path forces human even with a model label', () => {
  const r = resolveAuthority({ config, labels: ['approve:model'],
    changedFiles: ['tagwell-app/src/main/java/x/security/Y.java'] });
  assert.equal(r.authority, 'human');
  assert.match(r.reason, /^risk-path:/);
});

test('human label beats a model label on the same PR', () => {
  const r = resolveAuthority({ config, labels: ['approve:model', 'approve:human'], changedFiles: ['src/a.ts'] });
  assert.deepEqual(r, { authority: 'human', reason: 'label:human' });
});

test('a model label selects model when no risk or hold applies', () => {
  const r = resolveAuthority({ config, labels: ['approve:model'], changedFiles: ['src/a.ts'] });
  assert.deepEqual(r, { authority: 'model', reason: 'label:model' });
});
