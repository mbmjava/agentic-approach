import test from 'node:test';
import assert from 'node:assert/strict';
import { runApproval } from './apply.mjs';

const config = {
  rollupBranch: 'main',
  judgeMergeTargets: ['rc/**'],
  labels: { hold: 'approve:hold' },
  riskPaths: ['**/security/**'],
  merge: { method: 'squash' },
  forge: { provider: 'github' },
};

function fakeForge({ labels = [], files = ['src/a.ts'], baseRef = 'rc/v1-feature-a', headSha = 'sha',
  description = 'Spec ID: SPEC-001', ci = 'pass', onMerge, lateBaseRef, lateHeadSha } = {}) {
  let reads = 0;
  return {
    getChange: async () => {
      reads += 1;
      return { id: 1, headSha: reads > 1 ? lateHeadSha ?? headSha : headSha,
        baseRef: reads > 1 ? lateBaseRef ?? baseRef : baseRef,
        changedFiles: files, labels, description };
    },
    getChecks: async () => ({ state: ci }),
    merge: async (id, opts) => { onMerge?.(id, opts); return { merged: true }; },
  };
}

async function evaluate(options = {}) {
  const specModeLoader = options.specModeLoader ?? (async ({ specId }) => ({
    specId,
    approvalMode: options.approvalMode ?? 'judge',
    trustedRef: 'refs/remotes/origin/main',
    trustedSha: 'main-sha',
  }));
  return runApproval({
    config,
    forge: fakeForge(options),
    pr: 1,
    judgeVerdict: options.judgeVerdict ?? 'approve',
    expectedHeadSha: options.expectedHeadSha ?? 'sha',
    expectedSpecSha: options.expectedSpecSha ?? 'main-sha',
    allowMerge: options.allowMerge ?? false,
    specModeLoader,
  });
}

test('judge spec + CI pass + judge approve: dry-run reports merge but does not call merge', async () => {
  let merged = false;
  const r = await runApproval({ config, forge: fakeForge({ onMerge: () => { merged = true; } }), pr: 1,
    judgeVerdict: 'approve', expectedHeadSha: 'sha', expectedSpecSha: 'main-sha',
    specModeLoader: async () => ({ specId: 'SPEC-001', approvalMode: 'judge', trustedSha: 'main-sha' }) });
  assert.equal(r.decision.action, 'merge');
  assert.equal(r.authority.reason, 'spec-mode:judge');
  assert.equal(r.merged, 'dry-run');
  assert.equal(merged, false);
});

test('allowMerge merges only the eligible RC and binds the merge to the reviewed head SHA', async () => {
  let called = null;
  const r = await evaluate({ headSha: 'abc', expectedHeadSha: 'abc', allowMerge: true,
    onMerge: (id, opts) => { called = { id, opts }; } });
  assert.deepEqual(called, { id: 1, opts: { method: 'squash', sha: 'abc' } });
  assert.deepEqual(r.merged, { merged: true });
});

test('target or head changes between evaluation and merge block the actuator', async () => {
  for (const options of [{ lateBaseRef: 'main' }, { lateHeadSha: 'new-sha' }]) {
    let merged = false;
    const r = await runApproval({ config, forge: fakeForge({ ...options, onMerge: () => { merged = true; } }),
      pr: 1, judgeVerdict: 'approve', expectedHeadSha: 'sha', expectedSpecSha: 'main-sha', allowMerge: true,
      specModeLoader: async () => ({ specId: 'SPEC-001', approvalMode: 'judge', trustedSha: 'main-sha' }) });
    assert.equal(r.decision.action, 'escalate');
    assert.match(r.decision.reason, /moved-before-merge/);
    assert.equal(merged, false);
  }
});

test('a judge verdict for another spec revision cannot authorize merge', async () => {
  const r = await runApproval({ config, forge: fakeForge(), pr: 1, judgeVerdict: 'approve',
    expectedHeadSha: 'sha', expectedSpecSha: 'old-spec-sha',
    specModeLoader: async () => ({ specId: 'SPEC-001', approvalMode: 'judge', trustedSha: 'new-spec-sha' }) });
  assert.equal(r.decision.action, 'escalate');
  assert.match(r.decision.reason, /spec-moved/);
  assert.equal(r.merged, null);
});

test('human spec mode never merges even with green CI and an approving judge', async () => {
  let merged = false;
  const r = await runApproval({ config, forge: fakeForge({ onMerge: () => { merged = true; } }), pr: 1,
    judgeVerdict: 'approve', expectedHeadSha: 'sha', expectedSpecSha: 'main-sha',
    specModeLoader: async () => ({ specId: 'SPEC-001', approvalMode: 'human', trustedSha: 'main-sha' }), allowMerge: true });
  assert.equal(r.decision.action, 'human');
  assert.equal(merged, false);
});

test('main remains human-only even when the spec says judge', async () => {
  const r = await evaluate({ baseRef: 'main' });
  assert.equal(r.authority.reason, 'target:human-only');
  assert.equal(r.decision.action, 'human');
  assert.equal(r.merged, null);
});

test('unlisted non-main targets cannot use judge authority', async () => {
  const r = await evaluate({ baseRef: 'develop' });
  assert.equal(r.authority.reason, 'target:not-judge-eligible');
  assert.equal(r.decision.action, 'human');
});

test('hold and risk-path overrides remain human even when spec mode is judge', async () => {
  assert.equal((await evaluate({ labels: ['approve:hold'] })).decision.action, 'human');
  const risk = await evaluate({ files: ['x/security/Y.java'] });
  assert.equal(risk.authority.reason, 'risk-path:**/security/**');
  assert.equal(risk.decision.action, 'human');
});

test('untrusted/missing spec authority fails closed to human', async () => {
  const r = await evaluate({ specModeLoader: async () => { throw new Error('spec not trusted'); } });
  assert.equal(r.authority.reason, 'spec-mode:unverified');
  assert.equal(r.decision.action, 'escalate');
  assert.match(r.decision.reason, /spec-sha-unverified/);
  assert.equal(r.spec.error, 'spec not trusted');
});

test('a non-approve judge verdict escalates and never merges', async () => {
  const r = await evaluate({ judgeVerdict: 'request-changes', allowMerge: true });
  assert.equal(r.decision.action, 'escalate');
  assert.equal(r.merged, null);
});

test('a failing CI result escalates and never merges', async () => {
  const r = await evaluate({ ci: 'fail', allowMerge: true });
  assert.equal(r.decision.action, 'escalate');
  assert.match(r.decision.reason, /ci:fail/);
  assert.equal(r.merged, null);
});

test('a head that moved after review escalates and never merges', async () => {
  const r = await evaluate({ headSha: 'newsha', expectedHeadSha: 'oldsha', allowMerge: true });
  assert.equal(r.decision.action, 'escalate');
  assert.match(r.decision.reason, /head-moved/);
  assert.equal(r.merged, null);
});

test('a missing reviewed head SHA escalates and never merges', async () => {
  const r = await evaluate({ expectedHeadSha: '', allowMerge: true });
  assert.equal(r.decision.action, 'escalate');
  assert.match(r.decision.reason, /head-sha-required/);
  assert.equal(r.merged, null);
});
