#!/usr/bin/env node
// Validate one approved requirement from the trusted ref before a spec-governed work wave starts.
// Missing or unverifiable authority blocks the wave; never consult the source branch or a default.
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadConfig } from './config.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
// Bootstrap pin: a work branch cannot select its own trusted spec ref via a changed config file.
// Change this together with .agentic/config.json in a human-reviewed framework update.
const TRUSTED_SPEC_BRANCH = 'main';
const APPROVED_STATUSES = new Set(['active', 'stable']);
const APPROVAL_MODES = new Set(['human', 'judge']);
const SPEC_TYPES = new Set(['feature', 'bugfix', 'enhancement', 'infra', 'research']);
const REQUIRED_FIELDS = ['type', 'spec_id', 'status', 'approval_mode', 'spec_type'];

function trustedBranch(config) {
  const branch = config.rollupBranch;
  if (typeof branch !== 'string' || !/^[A-Za-z0-9._/-]+$/.test(branch)
      || branch.startsWith('-') || branch.includes('..')) {
    throw new Error('configured rollupBranch is not a valid trusted ref');
  }
  if (branch !== TRUSTED_SPEC_BRANCH) {
    throw new Error(`configured rollupBranch must match trusted spec branch '${TRUSTED_SPEC_BRANCH}'`);
  }
  return branch;
}

function frontmatterEntries(markdown) {
  const lines = markdown.replace(/^\uFEFF/, '').split(/\r?\n/);
  if (lines[0]?.trim() !== '---') return null;
  const end = lines.indexOf('---', 1);
  if (end < 0) return null;
  const entries = new Map();
  for (const line of lines.slice(1, end)) {
    const match = /^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*?)\s*$/.exec(line);
    if (!match) continue;
    const values = entries.get(match[1]) ?? [];
    values.push(match[2]);
    entries.set(match[1], values);
  }
  return entries;
}

function scalar(value) {
  const withoutComment = value.replace(/\s+#.*$/, '').trim();
  if (withoutComment.length >= 2) {
    const first = withoutComment[0];
    const last = withoutComment.at(-1);
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return withoutComment.slice(1, -1);
    }
  }
  return withoutComment;
}

function requiredField(entries, field, specPath) {
  const values = entries.get(field) ?? [];
  if (values.length !== 1) throw new Error(`${specPath}: ${field} must appear exactly once in frontmatter`);
  const value = scalar(values[0]);
  if (!value) throw new Error(`${specPath}: ${field} must not be blank`);
  return value;
}

export function resolveApprovedSpec({ specId, files, readFile }) {
  if (typeof specId !== 'string' || !specId.trim() || /\s/.test(specId)) {
    throw new Error('spec_id must be a non-empty, single token');
  }
  const candidates = [];
  for (const specPath of files) {
    if (!specPath.endsWith('.md')) continue;
    const entries = frontmatterEntries(readFile(specPath));
    if ((entries?.get('spec_id') ?? []).some((value) => scalar(value) === specId)) candidates.push({ specPath, entries });
  }
  if (candidates.length !== 1) {
    throw new Error(candidates.length === 0
      ? `no trusted requirement has spec_id '${specId}'`
      : `spec_id '${specId}' is not unique on the trusted ref`);
  }

  const { specPath, entries } = candidates[0];
  const values = Object.fromEntries(REQUIRED_FIELDS.map((field) => [field, requiredField(entries, field, specPath)]));
  if (values.type !== 'requirement') throw new Error(`${specPath}: type must be exactly 'requirement'`);
  if (values.spec_id !== specId) throw new Error(`${specPath}: spec_id does not match '${specId}'`);
  if (!APPROVED_STATUSES.has(values.status)) throw new Error(`${specPath}: status '${values.status}' is not approved`);
  if (!APPROVAL_MODES.has(values.approval_mode)) throw new Error(`${specPath}: approval_mode must be 'human' or 'judge'`);
  if (!SPEC_TYPES.has(values.spec_type)) throw new Error(`${specPath}: spec_type is not a supported formalizer type`);
  return { specId, approvalMode: values.approval_mode, specType: values.spec_type, specPath };
}

function git(args) {
  try {
    return execFileSync('git', args, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 30_000,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    }).trim();
  } catch {
    throw new Error(`git ${args[0]} failed; approval preflight cannot verify trusted data`);
  }
}

export function runPreflight({ specId, config, gitCommand = git }) {
  const branch = trustedBranch(config);
  gitCommand(['check-ref-format', '--branch', branch]);
  gitCommand(['fetch', '--quiet', 'origin', `refs/heads/${branch}:refs/remotes/origin/${branch}`]);
  const trustedRef = `refs/remotes/origin/${branch}`;
  const trustedSha = gitCommand(['rev-parse', '--verify', `${trustedRef}^{commit}`]);
  const paths = gitCommand(['ls-tree', '-r', '--name-only', trustedSha, '--', 'docs/requirements'])
    .split(/\r?\n/).filter(Boolean);
  const spec = resolveApprovedSpec({
    specId,
    files: paths,
    readFile: (path) => gitCommand(['show', `${trustedSha}:${path}`]),
  });
  return { ...spec, trustedRef, trustedSha };
}

export function assertTrustedCheckout({ config, gitCommand = git }) {
  const branch = trustedBranch(config);
  gitCommand(['check-ref-format', '--branch', branch]);
  if (gitCommand(['branch', '--show-current']) !== branch) {
    throw new Error(`live PR authority must be resolved from trusted branch '${branch}'`);
  }
  if (gitCommand(['status', '--porcelain', '--untracked-files=all'])) {
    throw new Error('live PR authority must be resolved from a clean trusted checkout');
  }
  gitCommand(['fetch', '--quiet', 'origin', `refs/heads/${branch}:refs/remotes/origin/${branch}`]);
  const trustedSha = gitCommand(['rev-parse', '--verify', `refs/remotes/origin/${branch}^{commit}`]);
  const headSha = gitCommand(['rev-parse', '--verify', 'HEAD^{commit}']);
  if (headSha !== trustedSha) throw new Error('live PR authority requires a trusted checkout synchronized with origin');
  return { trustedRef: `refs/remotes/origin/${branch}`, trustedSha };
}

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const specId = arg('--spec-id');
  if (!specId) {
    console.error('Usage: node scripts/agentic/preflight.mjs --spec-id <spec_id>');
    process.exitCode = 2;
    return;
  }
  try {
    const result = runPreflight({ specId, config: loadConfig(ROOT) });
    console.log(JSON.stringify({ status: 'ready', ...result }, null, 2));
  } catch (error) {
    console.error(`implementation preflight blocked: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
