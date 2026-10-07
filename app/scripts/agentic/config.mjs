import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PROVIDERS = new Set(['github', 'gitlab']);
const AUTHORITIES = new Set(['model', 'human']);

// Loads the forge/harness-neutral approval policy. One file, no forge- or CLI-specific fields.
export function loadConfig(root = process.cwd()) {
  const file = resolve(root, '.agentic/config.json');
  const config = JSON.parse(readFileSync(file, 'utf8'));
  if (!config.forge || !PROVIDERS.has(config.forge.provider)) {
    throw new Error(`${file}: forge.provider must be one of ${[...PROVIDERS].join(', ')}`);
  }
  if (!config.approval || !AUTHORITIES.has(config.approval.default)) {
    throw new Error(`${file}: approval.default must be 'model' or 'human'`);
  }
  const labels = config.labels ?? {};
  for (const key of ['model', 'human', 'hold']) {
    if (typeof labels[key] !== 'string' || labels[key].length === 0) {
      throw new Error(`${file}: labels.${key} is required`);
    }
  }
  if (!Array.isArray(config.riskPaths)) throw new Error(`${file}: riskPaths must be an array`);
  if (typeof config.rollupBranch !== 'string' || config.rollupBranch.length === 0) {
    throw new Error(`${file}: rollupBranch is required (e.g. 'develop'; switch to 'main' later)`);
  }
  return config;
}
