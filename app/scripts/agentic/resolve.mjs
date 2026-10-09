#!/usr/bin/env node
// Resolve authority from the approved spec on trusted rollupBranch; labels only provide the hold brake.
//
//   node scripts/agentic/resolve.mjs --spec-id SPEC-001 [--files a.ts,b.java]
//   node scripts/agentic/resolve.mjs --pr 5          # live; trusted clean checkout + forge token required
import { pathToFileURL } from 'node:url';
import { loadConfig } from './config.mjs';
import { resolveAuthority } from './authority.mjs';
import { assertTrustedCheckout } from './preflight.mjs';
import { createForge } from './forge/index.mjs';
import { extractSpecId, loadSpecMode } from './spec-reference.mjs';

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const config = loadConfig();
  const pr = arg('--pr');
  let specId = arg('--spec-id') ?? null;
  let labels = (arg('--labels') ?? '').split(',').filter(Boolean);
  let changedFiles = (arg('--files') ?? '').split(',').filter(Boolean);
  let baseRef;
  let spec = null;
  let specError = null;

  if (pr && specId) {
    console.error('Do not pass --spec-id with --pr; the PR description is authoritative');
    process.exitCode = 2;
    return;
  }
  if (!pr && !specId) {
    console.error('Usage: node scripts/agentic/resolve.mjs --spec-id <id> [--files a.ts,b.java] [--labels label] | --pr <n>');
    process.exitCode = 2;
    return;
  }

  try {
    if (pr) {
      assertTrustedCheckout({ config });
      const forge = createForge({ config, token: process.env.AGENTIC_FORGE_TOKEN });
      const change = await forge.getChange(Number(pr));
      labels = change.labels;
      changedFiles = change.changedFiles;
      baseRef = change.baseRef;
      specId = extractSpecId(change.description);
    }
    spec = await loadSpecMode({ specId, config });
  } catch (error) {
    specError = error.message;
    process.exitCode = 1;
  }

  const result = resolveAuthority({ config, labels, changedFiles, approvalMode: spec?.approvalMode,
    specError, baseRef });
  console.log(JSON.stringify({ ...result,
    spec: { specId: spec?.specId ?? specId, approvalMode: spec?.approvalMode ?? null,
      trustedRef: spec?.trustedRef ?? null, trustedSha: spec?.trustedSha ?? null, error: specError },
    forge: config.forge.provider, files: changedFiles, labels, baseRef }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
