import test from 'node:test';
import assert from 'node:assert/strict';
import { extractSpecId, loadSpecMode } from './spec-reference.mjs';

test('extracts one case-insensitive Spec ID line and normalizes its label spacing', () => {
  assert.equal(extractSpecId('Summary\n  sPeC   iD : SPEC-2026-001  \nChecks'), 'SPEC-2026-001');
});

test('rejects missing, duplicate, and malformed Spec ID lines', () => {
  assert.throws(() => extractSpecId('no spec'), /one Spec ID/);
  assert.throws(() => extractSpecId('Spec ID: A\nSPEC ID: B'), /exactly one/);
  assert.throws(() => extractSpecId('Spec ID: two words'), /malformed/);
});

test('loads approval mode only through the trusted preflight', () => {
  let request;
  const preflight = (input) => { request = input; return { specId: input.specId, approvalMode: 'human' }; };
  assert.deepEqual(loadSpecMode({ specId: 'SPEC-1', config: { rollupBranch: 'main' }, preflight }), {
    specId: 'SPEC-1', approvalMode: 'human',
  });
  assert.deepEqual(request, { specId: 'SPEC-1', config: { rollupBranch: 'main' } });
});
