#!/usr/bin/env node
// Resolve the approval authority for a change, portably.
//
//   node scripts/agentic/resolve.mjs --files a.ts,b.java --labels approve:model
//   node scripts/agentic/resolve.mjs --pr 5          # live, needs AGENTIC_FORGE_TOKEN
import { loadConfig } from './config.mjs';
import { resolveAuthority } from './authority.mjs';
import { createForge } from './forge/index.mjs';

function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const config = loadConfig();
const pr = arg('--pr');
let files = (arg('--files') ?? '').split(',').filter(Boolean);
let labels = (arg('--labels') ?? '').split(',').filter(Boolean);

if (pr) {
  const forge = createForge({ config, token: process.env.AGENTIC_FORGE_TOKEN });
  const change = await forge.getChange(pr);
  files = change.changedFiles;
  labels = change.labels;
}

const result = resolveAuthority({ config, labels, changedFiles: files });
console.log(JSON.stringify({ ...result, forge: config.forge.provider, files, labels }, null, 2));
