#!/usr/bin/env node
/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// Read-only canary verifier: fetches a URL and reports whether the
// authorship markers from src/watermark.ts are present. It never writes,
// posts, or mutates anything — fetch and report only.
//
// Usage: npm run canary:verify -- https://example.com

import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

const watermarkSource = readFileSync(join(ROOT, 'src', 'watermark.ts'), 'utf8');
const uuidMatch = watermarkSource.match(/CANARY_UUID = '([0-9a-f-]{36})'/);
if (!uuidMatch) {
  console.error('Could not read CANARY_UUID from src/watermark.ts');
  process.exit(2);
}
const UUID = uuidMatch[1];
const SPDX_TAG = 'AGPL-3.0-only';

// Recompute the zero-width signature exactly as src/watermark.ts defines it.
const ZERO = '\u200B';
const ONE = '\u200C';
const hex = UUID.replaceAll('-', '').slice(0, 8);
let signature = '';
for (const char of hex) {
  const bits = parseInt(char, 16).toString(2).padStart(4, '0');
  for (const bit of bits) {
    signature += bit === '1' ? ONE : ZERO;
  }
}

// Minifiers usually emit non-ASCII as \uXXXX escapes, so accept both the
// raw characters (rendered DOM / HTML) and the escaped form (bundle text).
const escaped = [...signature]
  .map((c) => `\\u200${c === ONE ? 'c' : 'b'}`)
  .join('');

function containsSignature(text) {
  return text.includes(signature) || text.toLowerCase().includes(escaped);
}

const url = process.argv[2];
if (!url) {
  console.error('Usage: npm run canary:verify -- <url>');
  process.exit(2);
}

const green = (s) => `\u001B[32m${s}\u001B[0m`;
const red = (s) => `\u001B[31m${s}\u001B[0m`;
const bold = (s) => `\u001B[1m${s}\u001B[0m`;

async function fetchText(target) {
  const res = await fetch(target, {
    redirect: 'follow',
    headers: { 'User-Agent': 'feature-cards-canary-verify (read-only)' },
  });
  return { ok: res.ok, status: res.status, text: await res.text() };
}

console.log(`\nScanning ${bold(url)} for feature-cards authorship markers…\n`);

const page = await fetchText(url);
if (!page.ok) {
  console.error(red(`Fetch failed: HTTP ${page.status}`));
  process.exit(2);
}

// Also scan any same-page <script src> bundles for the markers.
const scriptUrls = [...page.text.matchAll(/<script[^>]+src=["']([^"']+)["']/g)]
  .map((m) => new URL(m[1], url).href)
  .slice(0, 10);

let corpus = page.text;
for (const scriptUrl of scriptUrls) {
  try {
    const js = await fetchText(scriptUrl);
    if (js.ok) {
      corpus += `\n${js.text}`;
    }
  } catch {
    // Unreachable script — skip; this tool only reports what it can see.
  }
}

const checks = [
  { name: `Canary UUID (${UUID})`, found: corpus.includes(UUID) },
  { name: 'Zero-width signature', found: containsSignature(corpus) },
  { name: `SPDX tag (${SPDX_TAG})`, found: corpus.includes(SPDX_TAG) },
];

for (const check of checks) {
  console.log(`  ${check.found ? green('FOUND  ') : red('MISSING')} ${check.name}`);
}

const matched = checks.filter((c) => c.found).length;
console.log('');

if (matched > 0) {
  let commit = 'unknown';
  try {
    commit = execSync('git rev-parse --short HEAD', {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    // Not a git checkout — commit stays "unknown".
  }
  console.log(bold(green(`MATCH — ${matched}/${checks.length} markers present.`)));
  console.log(
    `\nThis code originates from https://github.com/humza/feature-cards (commit ${commit}).`,
  );
  console.log(
    'It is licensed AGPL-3.0-only: serving it to users over a network obligates the',
  );
  console.log(
    'operator to provide the complete corresponding source under the same licence.\n',
  );
  process.exit(0);
} else {
  console.log(bold(red('NO MATCH — no authorship markers found at this URL.')));
  console.log('');
  process.exit(1);
}
