import test from 'node:test';
import assert from 'node:assert/strict';
import { assertTrustedCheckout, resolveApprovedSpec, runPreflight } from './preflight.mjs';

const config = { rollupBranch: 'main' };
const spec = `---
title: Example
type: requirement
status: active
spec_id: SPEC-001
spec_type: feature
approval_mode: judge
---
# Example
`;

test('resolves one active spec and its spec-time approval mode', () => {
  assert.deepEqual(resolveApprovedSpec({ specId: 'SPEC-001', files: ['docs/requirements/example.md'],
    readFile: () => spec }), {
    specId: 'SPEC-001', approvalMode: 'judge', specType: 'feature', specPath: 'docs/requirements/example.md',
  });
});

test('blocks missing, duplicate, draft, and malformed spec authority', () => {
  assert.throws(() => resolveApprovedSpec({ specId: 'SPEC-001', files: [], readFile: () => spec }), /no trusted requirement/);
  assert.throws(() => resolveApprovedSpec({ specId: 'SPEC-001', files: ['a.md', 'b.md'], readFile: () => spec }), /not unique/);
  assert.throws(() => resolveApprovedSpec({ specId: 'SPEC-001', files: ['a.md'], readFile: () => spec.replace('status: active', 'status: draft') }), /not approved/);
  assert.throws(() => resolveApprovedSpec({ specId: 'SPEC-001', files: ['a.md'], readFile: () => spec.replace('approval_mode: judge', 'approval_mode: model') }), /approval_mode/);
  assert.throws(() => resolveApprovedSpec({ specId: 'SPEC 001', files: ['a.md'], readFile: () => spec }), /single token/);
});

test('preflight fetches and reads the spec from the pinned trusted ref', () => {
  const calls = [];
  const gitCommand = (args) => {
    calls.push(args);
    if (args[0] === 'check-ref-format') return 'main';
    if (args[0] === 'fetch') return '';
    if (args[0] === 'rev-parse') return 'trusted-sha';
    if (args[0] === 'ls-tree') return 'docs/requirements/example.md';
    if (args[0] === 'show') return spec;
    throw new Error(`unexpected git command ${args.join(' ')}`);
  };
  const result = runPreflight({ config, specId: 'SPEC-001', gitCommand });
  assert.equal(result.approvalMode, 'judge');
  assert.equal(result.trustedRef, 'refs/remotes/origin/main');
  assert.equal(result.trustedSha, 'trusted-sha');
  assert.deepEqual(calls[1], ['fetch', '--quiet', 'origin', 'refs/heads/main:refs/remotes/origin/main']);
  assert.deepEqual(calls[3], ['ls-tree', '-r', '--name-only', 'trusted-sha', '--', 'docs/requirements']);
});

test('preflight refuses an alternate trusted-branch setting', () => {
  assert.throws(() => runPreflight({ config: { rollupBranch: 'feature' }, specId: 'SPEC-001', gitCommand: () => '' }), /must match trusted spec branch/);
});

test('live approval requires a clean checkout synchronized to trusted main', () => {
  const outputs = ['', 'main', '', '', 'same-sha', 'same-sha'];
  const gitCommand = () => outputs.shift();
  assert.deepEqual(assertTrustedCheckout({ config, gitCommand }), {
    trustedRef: 'refs/remotes/origin/main', trustedSha: 'same-sha',
  });

  const dirty = ['', 'main', ' M file.md'];
  assert.throws(() => assertTrustedCheckout({ config, gitCommand: () => dirty.shift() }), /clean trusted checkout/);

  const moved = ['', 'main', '', '', 'remote-sha', 'local-sha'];
  assert.throws(() => assertTrustedCheckout({ config, gitCommand: () => moved.shift() }), /synchronized with origin/);
});
