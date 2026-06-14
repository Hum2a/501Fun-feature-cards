#!/usr/bin/env node
/**
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * Keep published-version pins in docs/examples aligned with package.json.
 *
 * Usage:
 *   node scripts/sync-version-pins.mjs
 *   node scripts/sync-version-pins.mjs --check
 *   VERSION_SEMVER=1.0.9 node scripts/sync-version-pins.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const checkOnly = process.argv.includes('--check');

/** @param {string} version */
function parseSemver(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-.+)?$/.exec(version);
  if (!match) {
    throw new Error(`Invalid semver: ${version}`);
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

/** @param {number} major @param {number} minor @param {number} patch */
function formatSemver(major, minor, patch) {
  return `${major}.${minor}.${patch}`;
}

/** @param {string} version */
function bumpPatch(version) {
  const { major, minor, patch } = parseSemver(version);
  return formatSemver(major, minor, patch + 1);
}

/** @param {string} version */
function bumpMinor(version) {
  const { major, minor } = parseSemver(version);
  return formatSemver(major, minor + 1, 0);
}

/** @param {string} version */
function bumpMajor(version) {
  const { major } = parseSemver(version);
  return formatSemver(major + 1, 0, 0);
}

/** @param {string} version @param {string} text */
function applyVersionPins(version, text) {
  const { major, minor } = parseSemver(version);
  const patchNext = bumpPatch(version);
  const minorNext = bumpMinor(version);
  const majorNext = bumpMajor(version);

  let out = text;

  out = out.replace(/@techystuff\/feature-cards@\d+\.\d+\.\d+/g, `@techystuff/feature-cards@${version}`);
  out = out.replace(
    /unpkg\.com\/@techystuff\/feature-cards@\d+\.\d+\.\d+/g,
    `unpkg.com/@techystuff/feature-cards@${version}`,
  );
  out = out.replace(/\*\*Package version:\*\* `\d+\.\d+\.\d+`/g, `**Package version:** \`${version}\``);
  out = out.replace(
    /\*\*Package:\*\* `@techystuff\/feature-cards` · \*\*Version:\*\* `\d+\.\d+\.\d+`/g,
    `**Package:** \`@techystuff/feature-cards\` · **Version:** \`${version}\``,
  );
  out = out.replace(
    /\*\*Package:\*\* `@techystuff\/feature-cards@\d+\.\d+\.\d+`/g,
    `**Package:** \`@techystuff/feature-cards@${version}\``,
  );
  out = out.replace(
    /\| \*\*Current version\*\* \| `\d+\.\d+\.\d+`/g,
    `| **Current version** | \`${version}\``,
  );
  out = out.replace(
    /Pin package versions \(`@techystuff\/feature-cards@\d+\.\d+\.x`\)/g,
    `Pin package versions (\`@techystuff/feature-cards@${major}.${minor}.x\`)`,
  );
  out = out.replace(
    /Package version: \*\*\d+\.\d+\.\d+\*\*/g,
    `Package version: **${version}**`,
  );
  out = out.replace(
    /Align `v\d+\.\d+\.\d+` with `"version": "\d+\.\d+\.\d+"`/g,
    `Align \`v${version}\` with \`"version": "${version}"\``,
  );
  out = out.replace(
    /npm run release:patch\s+# \d+\.\d+\.\d+ → \d+\.\d+\.\d+/g,
    `npm run release:patch    # ${version} → ${patchNext}`,
  );
  out = out.replace(
    /npm run release:minor\s+# \d+\.\d+\.\d+ → \d+\.\d+\.\d+/g,
    `npm run release:minor    # ${version} → ${minorNext}`,
  );
  out = out.replace(
    /npm run release:major\s+# \d+\.\d+\.\d+ → \d+\.\d+\.\d+/g,
    `npm run release:major    # ${version} → ${majorNext}`,
  );

  return out;
}

const VERSION_FILES = [
  'README.md',
  'docs/INSTALL.md',
  'docs/README.md',
  'docs/FAQ.md',
  'docs/cookbook/wordpress.md',
  'docs/NPM-PUBLISH.md',
  'docs/RELEASE.md',
  'SECURITY.md',
  'docs/DEPENDENCY-UPGRADES.md',
];

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const version = process.env.VERSION_SEMVER ?? pkg.version;

const stale = [];

for (const rel of VERSION_FILES) {
  const path = join(ROOT, rel);
  let text;
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    continue;
  }

  const next = applyVersionPins(version, text);
  if (next === text) {
    continue;
  }

  if (checkOnly) {
    stale.push(rel);
    continue;
  }

  writeFileSync(path, next, 'utf8');
  console.log(`  updated ${rel}`);
}

if (checkOnly) {
  if (stale.length > 0) {
    console.error('Version pin check failed — run `npm run version:sync`:\n');
    for (const file of stale) {
      console.error(`  ${file}`);
    }
    process.exit(1);
  }
  console.log(`Version pins OK (${VERSION_FILES.length} files checked, package.json ${version}).`);
  process.exit(0);
}

console.log(`Synced version pins to ${version}.`);
