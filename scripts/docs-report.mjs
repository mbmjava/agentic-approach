#!/usr/bin/env node
// Documentation staleness / orphan REPORT (non-blocking).
//
//   node scripts/docs-report.mjs
//
// WHY THIS EXISTS
// Nothing ever asks us to delete a doc, so stale and orphaned docs accumulate and can misdirect.
// This script does not fail the build — it prints short, actionable lists to run at the wave
// boundary (see the `prep-handoff` skill, which turns the top items into the handoff's
// "Docs to prune/refresh" line). Deletion is the default; "keep" needs a reason.
//
// Reports:
//   - aged: governed docs whose `last_updated` is older than a soft window (by `type`)
//   - orphaned: governed docs with no inbound relative link from another governed doc
//   - superseded-with-body: status `superseded` files that still carry body content
//   - handoff freshness: working-docs/handoff.md age vs the last commit (best effort)
//
// GOVERNED SET matches scripts/check-docs.mjs. Exempt: templates, observability.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, sep } from 'node:path';
import { execSync } from 'node:child_process';

const ROOTS = ['docs', 'working-docs'];
const today = new Date();
const toPosix = (p) => p.split(sep).join('/');
const exempt = (p) => p.includes('/standards/templates/')
  || p.startsWith('working-docs/observability/');

// Soft review windows in days, by frontmatter `type`. Report-only.
const WINDOW = {
  standard: 90, architecture: 90, decision: 365, requirement: 180,
  product: 180, runbook: 180, plan: 120, handoff: 7, index: 90,
};
const ageDays = (iso) => {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((today - d) / 86_400_000);
};

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (name.endsWith('.md')) out.push(full);
  }
  return out;
}

function frontmatter(md) {
  const lines = md.split(/\r?\n/);
  if (lines[0] !== '---') return {};
  const end = lines.indexOf('---', 1);
  if (end < 0) return {};
  const fm = {};
  for (const line of lines.slice(1, end)) {
    const m = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (m) fm[m[1]] = m[2].trim();
  }
  return fm;
}

const files = ROOTS.flatMap((r) => walk(r)).map(toPosix).filter((p) => !exempt(p));
const docs = files.map((p) => {
  const md = readFileSync(p, 'utf8');
  return { path: p, md, fm: frontmatter(md) };
});

// Inbound-link map: which governed docs are referenced by another doc (governed, plus root
// entry points like AGENTS.md/README.md that link into the docs).
const linked = new Set();
const addLinks = (srcPath, md) => {
  const body = md.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  for (const m of body.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
    let t = m[1];
    if (/^(https?:|mailto:|tel:|#)/.test(t) || t.includes('://')) continue;
    t = t.split('#')[0].split('?')[0];
    if (!t || t.startsWith('/')) continue;
    linked.add(toPosix(join(dirname(srcPath), decodeURIComponent(t))));
  }
};
for (const d of docs) addLinks(d.path, d.md);
for (const entry of ['AGENTS.md', 'README.md']) {
  if (existsSync(entry)) addLinks(entry, readFileSync(entry, 'utf8'));
}

const aged = [];
const orphans = [];
const supersededWithBody = [];
for (const d of docs) {
  const type = (d.fm.type || '').trim();
  const lu = (d.fm.last_updated || '').trim();
  const age = ageDays(lu);
  const window = WINDOW[type] ?? 180;
  if (age !== null && age > window) aged.push({ path: d.path, type, age, window });
  if (!linked.has(d.path) && !d.path.endsWith('00-index.md')) orphans.push(d.path);
  if ((d.fm.status || '') === 'superseded') {
    const body = d.md.split(/\r?\n/).slice(1).filter((l) => !/^---/.test(l)).join('\n').trim();
    if (body.length > 200 && !/^SUPERSEDED BY/m.test(body)) supersededWithBody.push(d.path);
  }
}

function list(title, rows, fmt) {
  console.log(`\n## ${title} (${rows.length})`);
  if (!rows.length) { console.log('  — none'); return; }
  for (const r of rows) console.log('  ' + fmt(r));
}

console.log(`docs-report: ${docs.length} governed file(s), ${today.toISOString().slice(0, 10)}`);
list('Aged past soft window', aged.sort((a, b) => b.age - a.age),
  (r) => `${r.path}  (${r.type}, ${r.age}d > ${r.window}d)`);
list('Orphaned (no inbound relative link)', orphans, (p) => p);
list('Superseded but still has body', supersededWithBody, (p) => p);

// Handoff freshness (best effort): handoff.md last_updated vs the last commit date.
const handoff = docs.find((d) => d.path === 'working-docs/handoff.md');
console.log('\n## Handoff freshness');
if (!handoff) {
  console.log('  — working-docs/handoff.md not found');
} else {
  const lu = (handoff.fm.last_updated || '').trim();
  const age = ageDays(lu);
  let lastCommit = 'unknown';
  try { lastCommit = execSync('git log -1 --format=%cs', { encoding: 'utf8' }).trim(); } catch { /* not a repo */ }
  console.log(`  last_updated: ${lu || '(missing)'}  (${age === null ? '?' : age + 'd'} ago)  ·  last commit: ${lastCommit}`);
  console.log('  reminder: the handoff is overwritten each wave; it should be as fresh as the wave.');
}
console.log('\ndocs-report: report only — nothing failed.');
