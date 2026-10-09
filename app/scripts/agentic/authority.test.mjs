import test from 'node:test';
import assert from 'node:assert/strict';
import { globToRegExp, resolveAuthority } from './authority.mjs';

const config = {
  labels: { hold: 'approve:hold' },
  riskPaths: ['**/security/**', '**/pom.xml', '.github/workflows/**'],
  rollupBranch: 'main',
  judgeMergeTargets: ['rc/**'],
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

test('the spec-time judge mode grants model authority only on an eligible RC target', () => {
  assert.deepEqual(resolveAuthority({ config, approvalMode: 'judge', baseRef: 'rc/v1.2-feature-a' }),
    { authority: 'model', reason: 'spec-mode:judge' });
});

test('human spec mode never grants model authority', () => {
  assert.deepEqual(resolveAuthority({ config, approvalMode: 'human', baseRef: 'rc/v1.2-feature-a' }),
    { authority: 'human', reason: 'spec-mode:human' });
});

test('missing or unverifiable spec mode fails closed to human', () => {
  assert.deepEqual(resolveAuthority({ config, baseRef: 'rc/v1.2-feature-a' }),
    { authority: 'human', reason: 'spec-mode:missing' });
  assert.deepEqual(resolveAuthority({ config, specError: 'trusted ref unavailable' }),
    { authority: 'human', reason: 'spec-mode:unverified' });
  assert.deepEqual(resolveAuthority({ config, approvalMode: 'model', baseRef: 'rc/v1.2-feature-a' }),
    { authority: 'human', reason: 'spec-mode:invalid' });
});

test('missing target cannot report judge authority', () => {
  assert.deepEqual(resolveAuthority({ config, approvalMode: 'judge' }),
    { authority: 'human', reason: 'target:missing' });
});

test('hold forces human above the spec mode', () => {
  assert.deepEqual(resolveAuthority({ config, labels: ['approve:hold'], approvalMode: 'judge',
    baseRef: 'rc/v1.2-feature-a' }), { authority: 'human', reason: 'hold' });
});

test('a configured risk path forces human even with judge mode', () => {
  const result = resolveAuthority({ config, approvalMode: 'judge', baseRef: 'rc/v1.2-feature-a',
    changedFiles: ['tagwell-app/src/main/java/x/security/Y.java'] });
  assert.equal(result.authority, 'human');
  assert.match(result.reason, /^risk-path:/);
});

test('main is human-only even when the spec says judge', () => {
  assert.deepEqual(resolveAuthority({ config, approvalMode: 'judge', baseRef: 'main' }),
    { authority: 'human', reason: 'target:human-only' });
});

test('an unlisted non-main target is human-only', () => {
  assert.deepEqual(resolveAuthority({ config, approvalMode: 'judge', baseRef: 'develop' }),
    { authority: 'human', reason: 'target:not-judge-eligible' });
});

test('approval labels cannot grant or revoke judge authority; hold remains the only label override', () => {
  assert.deepEqual(resolveAuthority({ config, labels: ['approve:human'], approvalMode: 'judge',
    baseRef: 'rc/v1.2-feature-a' }), { authority: 'model', reason: 'spec-mode:judge' });
  assert.deepEqual(resolveAuthority({ config, labels: ['approve:model'], baseRef: 'rc/v1.2-feature-a' }),
    { authority: 'human', reason: 'spec-mode:missing' });
});
