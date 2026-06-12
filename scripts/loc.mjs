#!/usr/bin/env node
/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// Lines-of-code report for the repository.
//
// Usage:
//   npm run loc
//   npm run loc:json
//   npm run loc:report

import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, relative } from 'node:path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'coverage',
  '.git',
  'playwright-report',
  'test-results',
  '.wrangler',
  'worker/.wrangler',
]);

const SKIP_FILES = new Set(['package-lock.json', 'LICENSE']);

const CODE_EXTENSIONS = new Set([
  '.ts',
  '.js',
  '.mjs',
  '.css',
  '.html',
  '.json',
  '.toml',
  '.yml',
  '.yaml',
  '.sh',
]);

const DOC_EXTENSIONS = new Set(['.md', '.mdc']);

/** @typedef {{ files: number, total: number, blank: number, comment: number, code: number }} LineStats */

/** @returns {LineStats} */
function emptyStats() {
  return { files: 0, total: 0, blank: 0, comment: 0, code: 0 };
}

/** @param {LineStats} a @param {LineStats} b @returns {LineStats} */
function mergeStats(a, b) {
  return {
    files: a.files + b.files,
    total: a.total + b.total,
    blank: a.blank + b.blank,
    comment: a.comment + b.comment,
    code: a.code + b.code,
  };
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const rel = relative(ROOT, full).replace(/\\/g, '/');
    if (SKIP_DIRS.has(rel)) continue;
    if (statSync(full).isDirectory()) {
      yield* walk(full);
    } else if (!SKIP_FILES.has(entry)) {
      yield full;
    }
  }
}

/**
 * Rough line classification for JS/TS/CSS/HTML/shell-style comments.
 * @param {string} content
 * @param {string} ext
 */
function classifyLines(content, ext) {
  const lines = content.split('\n');
  let blank = 0;
  let comment = 0;
  let code = 0;
  let inBlock = false;

  const isDoc = DOC_EXTENSIONS.has(ext);

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      blank += 1;
      continue;
    }

    if (isDoc) {
      code += 1;
      continue;
    }

    if (inBlock) {
      comment += 1;
      if (trimmed.includes('*/')) inBlock = false;
      continue;
    }

    if (ext === '.html' && trimmed.startsWith('<!--')) {
      comment += 1;
      if (!trimmed.includes('-->')) inBlock = true;
      continue;
    }

    if (['.ts', '.js', '.mjs', '.css'].includes(ext)) {
      if (trimmed.startsWith('//')) {
        comment += 1;
        continue;
      }
      if (trimmed.startsWith('/*')) {
        comment += 1;
        if (!trimmed.includes('*/')) inBlock = true;
        continue;
      }
    }

    if (['.yml', '.yaml', '.sh', '.toml'].includes(ext) && trimmed.startsWith('#')) {
      comment += 1;
      continue;
    }

    if (ext === '.json') {
      code += 1;
      continue;
    }

    code += 1;
  }

  return {
    total: lines.length,
    blank,
    comment,
    code,
  };
}

function areaFor(relPath) {
  if (relPath.startsWith('src/')) return 'Source (src/)';
  if (relPath.startsWith('tests/')) return 'Tests (tests/)';
  if (relPath.startsWith('demo/')) return 'Demo (demo/)';
  if (relPath.startsWith('worker/')) return 'Worker (worker/)';
  if (relPath.startsWith('scripts/')) return 'Scripts (scripts/)';
  if (relPath.startsWith('docs/')) return 'Docs (docs/)';
  if (relPath.startsWith('.github/')) return 'CI (.github/)';
  if (relPath.startsWith('.cursor/')) return 'Cursor rules (.cursor/)';
  if (relPath.startsWith('config/')) return 'Config (config/)';
  return 'Root / other';
}

function kindFor(ext) {
  if (CODE_EXTENSIONS.has(ext)) return 'code';
  if (DOC_EXTENSIONS.has(ext)) return 'docs';
  return 'other';
}

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const writeIndex = args.indexOf('--write');
const writePath =
  writeIndex !== -1 ? args[writeIndex + 1] : args.includes('--report') ? 'docs/loc-report.md' : null;

/** @type {Map<string, LineStats>} */
const byArea = new Map();
/** @type {Map<string, LineStats>} */
const byExt = new Map();
/** @type {Map<string, LineStats>} */
const byKind = new Map();
/** @type {LineStats} */
const grand = emptyStats();

/** @type {Array<{ path: string, stats: LineStats & { ext: string, area: string } }>} */
const topFiles = [];

for (const file of walk(ROOT)) {
  const rel = relative(ROOT, file).replace(/\\/g, '/');
  const ext = extname(file) || '(none)';

  let content;
  try {
    content = readFileSync(file, 'utf8');
  } catch {
    continue;
  }

  if (content.includes('\0')) continue;

  const classified = classifyLines(content, ext);
  const stats = { files: 1, ...classified };
  const area = areaFor(rel);
  const kind = kindFor(ext);

  byArea.set(area, mergeStats(byArea.get(area) ?? emptyStats(), stats));
  byExt.set(ext, mergeStats(byExt.get(ext) ?? emptyStats(), stats));
  byKind.set(kind, mergeStats(byKind.get(kind) ?? emptyStats(), stats));
  Object.assign(grand, mergeStats(grand, stats));
  topFiles.push({ path: rel, stats: { ...stats, ext, area } });
}

topFiles.sort((a, b) => b.stats.code - a.stats.code);

function pct(part, whole) {
  return whole === 0 ? '0.0%' : `${((part / whole) * 100).toFixed(1)}%`;
}

function formatTable(title, rows, columns) {
  const lines = [`## ${title}`, ''];
  const header = `| ${columns.map((c) => c.label).join(' | ')} |`;
  const sep = `| ${columns.map((c) => '-'.repeat(Math.max(c.label.length, c.min ?? 3))).join(' | ')} |`;
  lines.push(header, sep);
  for (const row of rows) {
    lines.push(`| ${columns.map((c) => String(row[c.key] ?? '').padStart(c.padStart ? c.min : 0)).join(' | ')} |`);
  }
  return lines.join('\n');
}

function terminalTable(title, rows, keys) {
  const widths = keys.map((key) =>
    Math.max(key.length, ...rows.map((row) => String(row[key] ?? '').length)),
  );
  const rule = `  ${widths.map((w) => '-'.repeat(w)).join('  ')}`;
  const out = [`\n${title}`, rule];
  out.push(`  ${keys.map((key, i) => key.padEnd(widths[i])).join('  ')}`);
  out.push(rule);
  for (const row of rows) {
    out.push(`  ${keys.map((key, i) => String(row[key] ?? '').padEnd(widths[i])).join('  ')}`);
  }
  return out.join('\n');
}

const areaRows = [...byArea.entries()]
  .map(([area, s]) => ({
    area,
    files: s.files,
    total: s.total,
    code: s.code,
    comment: s.comment,
    blank: s.blank,
    codePct: pct(s.code, s.total),
  }))
  .sort((a, b) => b.code - a.code);

const extRows = [...byExt.entries()]
  .map(([ext, s]) => ({
    ext,
    files: s.files,
    total: s.total,
    code: s.code,
    comment: s.comment,
    blank: s.blank,
  }))
  .sort((a, b) => b.code - a.code);

const kindRows = [...byKind.entries()].map(([kind, s]) => ({
  kind,
  files: s.files,
  total: s.total,
  code: s.code,
  comment: s.comment,
  blank: s.blank,
}));

const topRows = topFiles.slice(0, 15).map(({ path, stats: s }) => ({
  path,
  code: s.code,
  total: s.total,
  area: s.area,
}));

const generated = new Date().toISOString();

const summary = {
  generated,
  files: grand.files,
  totalLines: grand.total,
  codeLines: grand.code,
  commentLines: grand.comment,
  blankLines: grand.blank,
  codePct: pct(grand.code, grand.total),
  byArea: Object.fromEntries(byArea),
  byExt: Object.fromEntries(byExt),
  byKind: Object.fromEntries(byKind),
  topFiles: topFiles.slice(0, 20).map(({ path, stats }) => ({ path, ...stats })),
};

if (asJson) {
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}

const dim = (s) => `\u001B[2m${s}\u001B[0m`;
const bold = (s) => `\u001B[1m${s}\u001B[0m`;

console.log(`\n${bold('feature-cards — lines of code report')}`);
console.log(dim(`Generated ${generated}\n`));
console.log(
  `  ${bold('Files')}        ${grand.files}`,
  `\n  ${bold('Total lines')}  ${grand.total}`,
  `\n  ${bold('Code')}         ${grand.code}  ${dim(`(${pct(grand.code, grand.total)} of total)`)}`,
  `\n  ${bold('Comments')}     ${grand.comment}`,
  `\n  ${bold('Blank')}        ${grand.blank}`,
);

console.log(
  terminalTable('By area', areaRows, ['area', 'files', 'code', 'comment', 'blank', 'codePct']),
);
console.log(terminalTable('By extension', extRows, ['ext', 'files', 'code', 'comment', 'blank']));
console.log(terminalTable('By kind', kindRows, ['kind', 'files', 'code', 'comment', 'blank']));
console.log(terminalTable('Largest files (by code lines)', topRows, ['path', 'code', 'total', 'area']));
console.log('');

const markdown = `# Lines of code report

Generated: ${generated}

## Summary

| Metric | Count |
| --- | ---: |
| Files | ${grand.files} |
| Total lines | ${grand.total} |
| Code lines | ${grand.code} |
| Comment lines | ${grand.comment} |
| Blank lines | ${grand.blank} |
| Code % | ${pct(grand.code, grand.total)} |

${formatTable('By area', areaRows, [
  { label: 'Area', key: 'area' },
  { label: 'Files', key: 'files', min: 5 },
  { label: 'Code', key: 'code', min: 5 },
  { label: 'Comments', key: 'comment', min: 8 },
  { label: 'Blank', key: 'blank', min: 5 },
  { label: 'Code %', key: 'codePct', min: 6 },
])}

${formatTable('By extension', extRows, [
  { label: 'Ext', key: 'ext' },
  { label: 'Files', key: 'files', min: 5 },
  { label: 'Code', key: 'code', min: 5 },
  { label: 'Comments', key: 'comment', min: 8 },
  { label: 'Blank', key: 'blank', min: 5 },
])}

${formatTable('By kind', kindRows, [
  { label: 'Kind', key: 'kind' },
  { label: 'Files', key: 'files', min: 5 },
  { label: 'Code', key: 'code', min: 5 },
  { label: 'Comments', key: 'comment', min: 8 },
  { label: 'Blank', key: 'blank', min: 5 },
])}

${formatTable('Top files (by code lines)', topRows, [
  { label: 'File', key: 'path' },
  { label: 'Code', key: 'code', min: 4 },
  { label: 'Total', key: 'total', min: 5 },
  { label: 'Area', key: 'area' },
])}

> Regenerate with \`npm run loc:report\`
`;

if (writePath) {
  const out = join(ROOT, writePath);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, markdown, 'utf8');
  console.log(dim(`Wrote ${writePath}`));
}
