import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PROVIDERS = new Set(['github', 'gitlab']);
// Loads the forge/harness-neutral approval policy. One file, no forge- or CLI-specific fields.
// Approval authority is read from an approved requirement, not configured as a repository default.
export function loadConfig(root = process.cwd()) {
  const file = resolve(root, '.agentic/config.json');
  const config = JSON.parse(readFileSync(file, 'utf8'));
  if (!config.forge || !PROVIDERS.has(config.forge.provider)) {
    throw new Error(`${file}: forge.provider must be one of ${[...PROVIDERS].join(', ')}`);
  }
  const labels = config.labels ?? {};
  if (typeof labels.hold !== 'string' || labels.hold.length === 0) {
    throw new Error(`${file}: labels.hold is required`);
  }
  if (!Array.isArray(config.riskPaths)) throw new Error(`${file}: riskPaths must be an array`);
  if (!Array.isArray(config.judgeMergeTargets)
      || config.judgeMergeTargets.some((target) => typeof target !== 'string' || target.length === 0)) {
    throw new Error(`${file}: judgeMergeTargets must be an array of non-empty branch patterns`);
  }
  if (typeof config.rollupBranch !== 'string' || config.rollupBranch.length === 0) {
    throw new Error(`${file}: rollupBranch is required (e.g. 'develop'; switch to 'main' later)`);
  }
  return config;
}
