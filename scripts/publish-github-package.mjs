#!/usr/bin/env node
/**
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * Publish the built library to GitHub Packages (npm.pkg.github.com) so the
 * package appears in this repository's sidebar "Packages" section.
 *
 * Consumers should still install from npm: @techystuff/feature-cards
 *
 * Usage:
 *   node scripts/publish-github-package.mjs
 *   node scripts/publish-github-package.mjs --dry-run
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const dryRun = process.argv.includes('--dry-run');

/** GitHub Packages scope must match the repo owner (Hum2a/feature-cards). */
const GITHUB_SCOPE = process.env.GITHUB_PACKAGES_SCOPE ?? 'hum2a';
const GITHUB_PACKAGE_NAME = `@${GITHUB_SCOPE}/feature-cards`;
const GITHUB_REGISTRY = 'https://npm.pkg.github.com';

const pkgPath = join(ROOT, 'package.json');
const originalPkgText = readFileSync(pkgPath, 'utf8');
const pkg = JSON.parse(originalPkgText);

function run(cmd) {
  if (dryRun) {
    console.log(`[dry-run] ${cmd}`);
    return '';
  }
  return execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
}

function runCapture(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim();
}

function currentTag() {
  try {
    return runCapture('git describe --tags --exact-match HEAD');
  } catch {
    return '';
  }
}

const tag = currentTag();
const version = pkg.version;
const expectedTag = `v${version}`;

if (!tag) {
  console.error('Error: HEAD is not tagged.');
  process.exit(1);
}

if (tag !== expectedTag && !tag.startsWith(`${expectedTag}-`)) {
  console.error(`Error: tag "${tag}" does not match package.json version "${version}".`);
  process.exit(1);
}

console.log(
  `Publishing ${GITHUB_PACKAGE_NAME}@${version} to GitHub Packages${dryRun ? ' [dry-run]' : ''}…\n`,
);

run('npm run pack:verify');

const ghPkg = {
  ...pkg,
  name: GITHUB_PACKAGE_NAME,
  publishConfig: {
    registry: GITHUB_REGISTRY,
    access: 'public',
  },
};

if (!dryRun) {
  writeFileSync(pkgPath, `${JSON.stringify(ghPkg, null, 2)}\n`, 'utf8');
}

try {
  if (dryRun) {
    console.log(
      `[dry-run] would publish ${GITHUB_PACKAGE_NAME}@${version} to ${GITHUB_REGISTRY}`,
    );
    run('npm publish --access public --dry-run --registry=https://npm.pkg.github.com');
  } else {
    run('npm publish --access public');
    console.log(`\nPublished ${GITHUB_PACKAGE_NAME}@${version} to GitHub Packages.`);
    console.log(
      'Install (GitHub Packages): npm install @hum2a/feature-cards --registry=https://npm.pkg.github.com',
    );
    console.log('Consumers should use npm: npm install @techystuff/feature-cards');
  }
} finally {
  if (!dryRun) {
    writeFileSync(pkgPath, originalPkgText, 'utf8');
  }
}
