import test from 'node:test';
import assert from 'node:assert/strict';
import { createGitHubForge } from './github.mjs';

const ok = (data) => ({ ok: true, status: 200, json: async () => data });

function fakeFetch({ files = [], checks = [] }) {
  return async (url) => {
    const page = Number(new URL(url).searchParams.get('page') ?? '1');
    if (url.includes('/files')) return ok(files[page - 1] ?? []);
    if (url.includes('/check-runs')) return ok({ check_runs: checks[page - 1] ?? [] });
    if (/\/pulls\/\d+$/.test(url)) {
      return ok({ head: { sha: 'abc' }, base: { ref: 'develop' }, user: { login: 'mike' }, draft: false,
        body: 'Spec ID: SPEC-001', labels: [] });
    }
    throw new Error(`unexpected url: ${url}`);
  };
}

const first100 = Array.from({ length: 100 }, (_, i) => ({ filename: `f${i}.ts` }));

test('changed files follow pagination and see a risk file on a later page', async () => {
  const forge = createGitHubForge({
    repo: 'o/r', token: 't',
    fetchImpl: fakeFetch({ files: [first100, [{ filename: 'pkg/security/Thing.java' }]] }),
  });
  const change = await forge.getChange(6);
  assert.equal(change.changedFiles.length, 101);
  assert.ok(change.changedFiles.includes('pkg/security/Thing.java'));
  assert.equal(change.description, 'Spec ID: SPEC-001');
});

test('check runs follow pagination and see a failing check on a later page', async () => {
  const pass = Array.from({ length: 100 }, (_, i) => ({ name: `c${i}`, status: 'completed', conclusion: 'success' }));
  const forge = createGitHubForge({
    repo: 'o/r', token: 't',
    fetchImpl: fakeFetch({ checks: [pass, [{ name: 'late', status: 'completed', conclusion: 'failure' }]] }),
  });
  const checks = await forge.getChecks('abc');
  assert.equal(checks.state, 'fail');
  assert.equal(checks.runs.length, 101);
});

test('an unexpectedly skipped check does not count as passing evidence', async () => {
  const forge = createGitHubForge({
    repo: 'o/r', token: 't',
    fetchImpl: fakeFetch({ checks: [[{ name: 'judge', status: 'completed', conclusion: 'skipped' }]] }),
  });
  const checks = await forge.getChecks('abc');
  assert.equal(checks.state, 'fail');
});

test('fails closed when the page cap is reached with a full page', async () => {
  const full = Array.from({ length: 100 }, (_, i) => ({ name: `c${i}`, status: 'completed', conclusion: 'success' }));
  const forge = createGitHubForge({ repo: 'o/r', token: 't', maxPages: 2,
    fetchImpl: fakeFetch({ checks: [full, full] }) });
  await assert.rejects(() => forge.getChecks('abc'), /cap/i);
});

test('mutations are disabled unless explicitly enabled', async () => {
  const forge = createGitHubForge({ repo: 'o/r', token: 't', fetchImpl: fakeFetch({}) });
  await assert.rejects(() => forge.merge(6), /read-only/);
  await assert.rejects(() => forge.postComment(6, 'hi'), /read-only/);
  await assert.rejects(() => forge.setLabel(6, 'x', true), /read-only/);
  await assert.rejects(() => forge.requestHumanReview(6, []), /read-only/);
});
