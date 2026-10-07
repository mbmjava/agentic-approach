#!/usr/bin/env node
// Documentation + link check (CI: docs-check).
//   - every governed Markdown file has valid frontmatter (title/type/status/owner/last_updated)
//   - no [[wiki-links]]
//   - relative Markdown links resolve to an existing file/dir (including the guide)
//   - the known-issues register keeps its schema
//
//   node scripts/check-docs.mjs
//
// Governed set (frontmatter required): docs/**/*.md and working-docs/**/*.md.
// Link-checked set: docs/**, working-docs/**.
// Exempt from frontmatter: docs/standards/templates/**, working-docs/observability/**.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, sep } from 'node:path';
import { checkKnownIssues } from './lib/known-issues-schema.mjs';

const FM_ROOTS = ['docs', 'working-docs'];
const LINK_ROOTS = ['docs', 'working-docs'];
const TYPES = new Set(['standard', 'architecture', 'requirement', 'decision', 'product',
  'runbook', 'plan', 'handoff', 'index']);
const STATUSES = new Set(['draft', 'active', 'stable', 'superseded']);
const REQUIRED = ['title', 'type', 'status', 'owner', 'last_updated'];

const toPosix = (p) => p.split(sep).join('/');
const exemptFm = (p) => p.includes('/standards/templates/') || p.startsWith('working-docs/observability/');
const inRoots = (p, roots) => roots.some((r) => p === r || p.startsWith(r + '/'));

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (name.endsWith('.md')) out.push(full);
  }
  return out;
}

/** Remove fenced and inline code so examples don't count as real links/wikilinks. */
function stripCode(md) {
  return md.replace(/```[\s\S]*?```/g, '').replace(/~~~[\s\S]*?~~~/g, '')
    .replace(/`[^`\n]*`/g, '');
}

function parseFrontmatter(md, file, errors) {
  const lines = md.split(/\r?\n/);
  if (lines[0] !== '---') { errors.push(`${file}: missing frontmatter (must start with ---)`); return; }
  const end = lines.indexOf('---', 1);
  if (end < 0) { errors.push(`${file}: frontmatter never closed with ---`); return; }
  const fm = {};
  for (const line of lines.slice(1, end)) {
    const m = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (m) fm[m[1]] = m[2].trim();
  }
  for (const key of REQUIRED) {
    if (!fm[key]) errors.push(`${file}: frontmatter missing '${key}'`);
  }
  if (fm.type && !TYPES.has(fm.type)) errors.push(`${file}: invalid type '${fm.type}'`);
  if (fm.status && !STATUSES.has(fm.status)) errors.push(`${file}: invalid status '${fm.status}'`);
  if (fm.last_updated && !/^\d{4}-\d{2}-\d{2}$/.test(fm.last_updated)) {
    errors.push(`${file}: last_updated must be YYYY-MM-DD (got '${fm.last_updated}')`);
  }
}

function checkLinks(md, file, errors) {
  const body = stripCode(md);
  if (/\[\[[^\]]+\]\]/.test(body)) {
    errors.push(`${file}: wiki-link [[…]] found — use a relative Markdown link instead`);
  }
  const dir = dirname(file);
  for (const m of body.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
    let target = m[1];
    if (/^(https?:|mailto:|tel:|#)/.test(target) || target.includes('://')) continue;
    target = target.split('#')[0].split('?')[0];
    if (!target || target.startsWith('/')) continue;
    const resolved = resolve(dir, decodeURIComponent(target));
    if (!existsSync(resolved)) {
      errors.push(`${file}: broken relative link -> ${m[1]}`);
    }
  }
}

const errors = [];
let checked = 0;
for (const root of LINK_ROOTS) {
  if (!existsSync(root)) continue;
  for (const file of walk(root)) {
    const posix = toPosix(file);
    if (!inRoots(posix, FM_ROOTS) || exemptFm(posix)) {
      // still link-check exempt files
      checkLinks(readFileSync(file, 'utf8'), posix, errors);
      continue;
    }
    checked++;
    const md = readFileSync(file, 'utf8');
    parseFrontmatter(md, posix, errors);
    checkLinks(md, posix, errors);
  }
}

const knownIssuesFile = 'docs/architecture/known-issues.md';
if (existsSync(knownIssuesFile)) {
  errors.push(...checkKnownIssues(readFileSync(knownIssuesFile, 'utf8'), knownIssuesFile));
}

console.log(`check-docs: ${checked} governed file(s) checked`);
if (errors.length) {
  for (const e of errors) console.error(`  x ${e}`);
  console.error(`check-docs: ${errors.length} problem(s)`);
  process.exit(1);
}
console.log('check-docs: OK');
