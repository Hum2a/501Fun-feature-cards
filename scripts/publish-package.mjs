#!/usr/bin/env node
/*!
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// Build the library bundle and publish to npm.
// Requires HEAD to match a git tag that aligns with package.json version.
//
// Usage:
//   npm run release:package
//   npm run release:package:dry
//   node scripts/publish-package.mjs --skip-check
//   node scripts/publish-package.mjs --otp=123456   # npm 2FA (local publish)

import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const dryRun = process.argv.includes('--dry-run');
const allowPrerelease = process.argv.includes('--allow-prerelease');
const skipCheck = process.argv.includes('--skip-check');

/** npm publish --otp= when 2FA is enabled on the account */
function readOtp() {
  const arg = process.argv.find((a) => a.startsWith('--otp='));
  if (arg) return arg.slice('--otp='.length);
  return process.env.NPM_OTP ?? '';
}

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const version = pkg.version;

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

/** Resolve the tag on the current commit, if any. */
function currentTag() {
  try {
    return runCapture('git describe --tags --exact-match HEAD');
  } catch {
    return '';
  }
}

const tag = currentTag();
const expectedStableTag = `v${version}`;

if (!tag) {
  console.error(
    'Error: HEAD is not tagged. Create a release tag first:\n' +
      '  npm run release -- --patch\n' +
      '  npm run release -- --minor --publish',
  );
  process.exit(1);
}

const isPrerelease = /^v\d+\.\d+\.\d+-/.test(tag);
const tagMatchesVersion =
  tag === expectedStableTag ||
  tag === `v${version}` ||
  tag.startsWith(`${expectedStableTag}-`);

if (!tagMatchesVersion) {
  console.error(
    `Error: git tag "${tag}" does not match package.json version "${version}".`,
  );
  process.exit(1);
}

if (isPrerelease && !allowPrerelease) {
  console.error(
    `Error: "${tag}" is a pre-release tag. Pass --allow-prerelease to publish it.`,
  );
  process.exit(1);
}

console.log(
  `Publishing ${pkg.name}@${version} (tag: ${tag})${dryRun ? ' [dry-run]' : ''}…\n`,
);

run('npm run pack:verify');

if (!skipCheck) {
  run('npm run typecheck');
  run('npm run lint');
  run('npm run test:ci');
  run('npm run size');
} else if (dryRun) {
  console.log('[dry-run] skipped test gate (--skip-check)');
}

if (dryRun) {
  run('npm publish --access public --dry-run');
  console.log('\nDry run complete — no package was published.');
  process.exit(0);
}

// Provenance attestation only works in supported CI (e.g. GitHub Actions with OIDC).
// Local `npm publish --provenance` fails with "provider: null".
const useProvenance =
  process.argv.includes('--provenance') ||
  (process.env.GITHUB_ACTIONS === 'true' && process.env.CI === 'true');
const otp = readOtp();
let publishCmd = useProvenance
  ? 'npm publish --access public --provenance'
  : 'npm publish --access public';
if (otp) {
  publishCmd += ` --otp=${otp}`;
}

if (!useProvenance) {
  console.log(
    'Publishing without provenance (local). CI uses --provenance automatically.',
  );
}
if (!otp && process.env.GITHUB_ACTIONS !== 'true') {
  console.log(
    'Tip: npm requires 2FA for publish — use --otp=CODE from your authenticator app.\n',
  );
}

run(publishCmd);
console.log(`\nPublished ${pkg.name}@${version} to npm.`);
