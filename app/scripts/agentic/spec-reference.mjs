import { runPreflight } from './preflight.mjs';

export function extractSpecId(description) {
  const lines = typeof description === 'string' ? description.split(/\r?\n/) : [];
  const references = lines.filter((line) => /^\s*spec\s+id\s*:/i.test(line));
  if (references.length !== 1) {
    throw new Error(references.length === 0 ? 'PR/MR description must contain one Spec ID line'
      : 'PR/MR description must contain exactly one Spec ID line');
  }
  const match = /^\s*spec\s+id\s*:\s*([A-Za-z0-9][A-Za-z0-9._-]*)\s*$/i.exec(references[0]);
  if (!match) throw new Error('PR/MR Spec ID line is malformed');
  return match[1];
}

export function loadSpecMode({ specId, config, preflight = runPreflight }) {
  return preflight({ specId, config });
}
