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

export async function runApproval({ config, forge, pr, judgeVerdict, expectedHeadSha, allowMerge = false }) {
  const change = await forge.getChange(pr);
  const guards = [];
  if (change.baseRef !== config.rollupBranch) guards.push(`base-branch:${change.baseRef}`);
  if (expectedHeadSha && change.headSha !== expectedHeadSha) guards.push('head-moved');
  const authority = resolveAuthority({ config, labels: change.labels, changedFiles: change.changedFiles });
  const checks = await forge.getChecks(change.headSha);
  const decision = guards.length
    ? { action: 'escalate', reason: guards.join(',') }
    : decide({ authority: authority.authority, ciState: checks.state, judgeVerdict });
  let merged = null;
  if (decision.action === 'merge') {
    merged = allowMerge
      ? await forge.merge(pr, { method: config.merge.method, sha: change.headSha })
      : 'dry-run';
  }
  return { pr, headSha: change.headSha, baseRef: change.baseRef, authority, ci: checks.state,
    judgeVerdict, guards, decision, merged };
}

function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const pr = arg('--pr');
  if (!pr) {
    console.error('Usage: node scripts/agentic/apply.mjs --pr <n> --judge <approve|request-changes|escalate> [--head-sha <sha>] [--allow-merge]');
    process.exitCode = 2;
    return;
  }
  const config = loadConfig();
  const allowMerge = process.argv.includes('--allow-merge');
  const forge = createForge({ config, token: process.env.AGENTIC_FORGE_TOKEN, allowMutations: allowMerge });
  try {
    const result = await runApproval({ config, forge, pr: Number(pr), judgeVerdict: arg('--judge'),
      expectedHeadSha: arg('--head-sha'), allowMerge });
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }, null, 2));
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
