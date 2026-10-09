#!/usr/bin/env node
// Approval-loop actuator. Resolves authority + CI + the judge verdict into an action, and merges
// only when the decision authorizes it. Dry-run by default; pass --allow-merge to actually merge.
// Bind the merge to the judged revision with --head-sha so a moved head is never merged unjudged.
//
//   node scripts/agentic/apply.mjs --pr 7 --judge approve --head-sha <sha>                # dry run
//   node scripts/agentic/apply.mjs --pr 7 --judge approve --head-sha <sha> --allow-merge
import { pathToFileURL } from 'node:url';
import { loadConfig } from './config.mjs';
import { resolveAuthority } from './authority.mjs';
import { decide } from './decide.mjs';
import { createForge } from './forge/index.mjs';
import { assertTrustedCheckout } from './preflight.mjs';
import { extractSpecId, loadSpecMode } from './spec-reference.mjs';

export async function runApproval({ config, forge, pr, judgeVerdict, expectedHeadSha, allowMerge = false,
  expectedSpecSha, specModeLoader = loadSpecMode }) {
  const change = await forge.getChange(pr);
  const guards = [];
  if (typeof expectedHeadSha !== 'string' || !expectedHeadSha.trim()) guards.push('head-sha-required');
  else if (change.headSha !== expectedHeadSha) guards.push('head-moved');
  if (typeof expectedSpecSha !== 'string' || !expectedSpecSha.trim()) guards.push('spec-sha-required');
  let specId = null;
  let spec = null;
  let specError = null;
  try {
    specId = extractSpecId(change.description);
    spec = await specModeLoader({ specId, config });
  } catch (error) {
    specError = error.message;
  }
  if (expectedSpecSha && spec?.trustedSha && spec.trustedSha !== expectedSpecSha) guards.push('spec-moved');
  else if (expectedSpecSha && !spec?.trustedSha) guards.push('spec-sha-unverified');
  const authority = resolveAuthority({ config, labels: change.labels, changedFiles: change.changedFiles,
    approvalMode: spec?.approvalMode, specError, baseRef: change.baseRef });
  const checks = await forge.getChecks(change.headSha);
  let decision = guards.length
    ? { action: 'escalate', reason: guards.join(',') }
    : decide({ authority: authority.authority, ciState: checks.state, judgeVerdict });
  let merged = null;
  if (decision.action === 'merge') {
    if (allowMerge) {
      const beforeMerge = await forge.getChange(pr);
      const lateGuards = [];
      if (beforeMerge.headSha !== change.headSha) lateGuards.push('head-moved-before-merge');
      if (beforeMerge.baseRef !== change.baseRef) lateGuards.push('target-moved-before-merge');
      if (lateGuards.length) decision = { action: 'escalate', reason: lateGuards.join(',') };
      else merged = await forge.merge(pr, { method: config.merge.method, sha: change.headSha });
    } else {
      merged = 'dry-run';
    }
  }
  return { pr, headSha: change.headSha, baseRef: change.baseRef,
    spec: { specId: spec?.specId ?? specId, approvalMode: spec?.approvalMode ?? null,
      trustedRef: spec?.trustedRef ?? null, trustedSha: spec?.trustedSha ?? null, error: specError },
    authority, ci: checks.state, judgeVerdict, guards, decision, merged };
}

function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const pr = arg('--pr');
  if (!pr) {
    console.error('Usage: node scripts/agentic/apply.mjs --pr <n> --judge <approve|request-changes|escalate> --head-sha <sha> --spec-sha <sha> [--allow-merge]');
    process.exitCode = 2;
    return;
  }
  const config = loadConfig();
  const allowMerge = process.argv.includes('--allow-merge');
  const expectedHeadSha = arg('--head-sha');
  const expectedSpecSha = arg('--spec-sha');
  if (!expectedHeadSha?.trim()) {
    console.error('--head-sha is required to bind the decision to the reviewed PR head');
    process.exitCode = 2;
    return;
  }
  if (!expectedSpecSha?.trim()) {
    console.error('--spec-sha is required to bind the decision to the reviewed trusted spec revision');
    process.exitCode = 2;
    return;
  }
  try {
    assertTrustedCheckout({ config });
    const forge = createForge({ config, token: process.env.AGENTIC_FORGE_TOKEN, allowMutations: allowMerge });
    const result = await runApproval({ config, forge, pr: Number(pr), judgeVerdict: arg('--judge'),
      expectedHeadSha, expectedSpecSha, allowMerge });
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }, null, 2));
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
