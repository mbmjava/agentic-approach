import test from 'node:test';
import assert from 'node:assert/strict';
import { runApproval } from './apply.mjs';

const config = {
  rollupBranch: 'develop',
  approval: { default: 'model' },
  labels: { model: 'approve:model', human: 'approve:human', hold: 'approve:hold' },
  riskPaths: ['**/security/**'],
  merge: { method: 'squash' },
  forge: { provider: 'github' },
};

function fakeForge({ labels = [], files = ['src/a.ts'], baseRef = 'develop', headSha = 'sha', ci = 'pass', onMerge } = {}) {
  return {
    getChange: async () => ({ headSha, baseRef, changedFiles: files, labels }),
    getChecks: async () => ({ state: ci }),
    merge: async (id, opts) => { onMerge?.(id, opts); return { merged: true }; },
  };
}

test('model + ci pass + judge approve: dry-run reports merge but does not call merge', async () => {
  let merged = false;
  const r = await runApproval({ config, forge: fakeForge({ onMerge: () => { merged = true; } }), pr: 1, judgeVerdict: 'approve' });
  assert.equal(r.decision.action, 'merge');
  assert.equal(r.merged, 'dry-run');
  assert.equal(merged, false);
});

test('allowMerge merges and binds the merge to the head SHA', async () => {
  let called = null;
  const r = await runApproval({ config, forge: fakeForge({ headSha: 'abc', onMerge: (id, opts) => { called = { id, opts }; } }),
    pr: 1, judgeVerdict: 'approve', expectedHeadSha: 'abc', allowMerge: true });
  assert.deepEqual(called, { id: 1, opts: { method: 'squash', sha: 'abc' } });
  assert.deepEqual(r.merged, { merged: true });
});

test('a risk path forces human and never merges, even with allowMerge', async () => {
  let merged = false;
  const r = await runApproval({ config, forge: fakeForge({ files: ['x/security/Y.java'], onMerge: () => { merged = true; } }),
    pr: 1, judgeVerdict: 'approve', allowMerge: true });
  assert.equal(r.decision.action, 'human');
  assert.equal(merged, false);
});

test('a non-approve judge verdict escalates and never merges', async () => {
  let merged = false;
  const r = await runApproval({ config, forge: fakeForge({ onMerge: () => { merged = true; } }),
    pr: 1, judgeVerdict: 'request-changes', allowMerge: true });
  assert.equal(r.decision.action, 'escalate');
  assert.equal(merged, false);
});

test('a wrong target branch escalates and never merges', async () => {
  let merged = false;
  const r = await runApproval({ config, forge: fakeForge({ baseRef: 'main', onMerge: () => { merged = true; } }),
    pr: 1, judgeVerdict: 'approve', allowMerge: true });
  assert.equal(r.decision.action, 'escalate');
  assert.match(r.decision.reason, /base-branch:main/);
  assert.equal(merged, false);
});

test('a head that moved after review escalates and never merges', async () => {
  let merged = false;
  const r = await runApproval({ config, forge: fakeForge({ headSha: 'newsha', onMerge: () => { merged = true; } }),
    pr: 1, judgeVerdict: 'approve', expectedHeadSha: 'oldsha', allowMerge: true });
  assert.equal(r.decision.action, 'escalate');
  assert.match(r.decision.reason, /head-moved/);
  assert.equal(merged, false);
});
