#!/usr/bin/env node
// Repo-level link check for the playbook and root entry points.
//
//   node scripts/check-guide-links.mjs
//
// Checks relative Markdown links in guide/**/*.md and the root README.md resolve to an existing
// file/directory. The starter under app/ has its own check (app/scripts/check-docs.mjs).
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, sep } from 'node:path';

const ROOTS = ['guide'];
const ENTRY = ['README.md'];
const toPosix = (p) => p.split(sep).join('/');

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (name.endsWith('.md')) out.push(full);
  }
  return out;
}

function stripCode(md) {
  return md.replace(/```[\s\S]*?```/g, '').replace(/~~~[\s\S]*?~~~/g, '').replace(/`[^`\n]*`/g, '');
}

const errors = [];
const files = [...ROOTS.flatMap((r) => walk(r)), ...ENTRY.filter(existsSync)];
for (const file of files) {
  const posix = toPosix(file);
  const body = stripCode(readFileSync(file, 'utf8'));
  for (const m of body.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
    let target = m[1];
    if (/^(https?:|mailto:|tel:|#)/.test(target) || target.includes('://')) continue;
    target = target.split('#')[0].split('?')[0];
    if (!target || target.startsWith('/')) continue;
    if (!existsSync(resolve(dirname(posix), decodeURIComponent(target)))) {
      errors.push(`${posix}: broken relative link -> ${m[1]}`);
    }
  }
}

console.log(`check-guide-links: ${files.length} file(s) checked`);
if (errors.length) {
  for (const e of errors) console.error(`  x ${e}`);
  process.exit(1);
}
console.log('check-guide-links: OK');
