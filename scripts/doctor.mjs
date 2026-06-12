#!/usr/bin/env node
/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// Toolchain doctor: verifies the local environment and prints a pass/fail table.

import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

const ok = (s) => `\u001B[32m${s}\u001B[0m`;
const bad = (s) => `\u001B[31m${s}\u001B[0m`;
const dim = (s) => `\u001B[2m${s}\u001B[0m`;

function tryExec(cmd) {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

const checks = [];

// Node version vs .nvmrc
const wanted = readFileSync(join(ROOT, '.nvmrc'), 'utf8').trim();
const nodeMajor = process.versions.node.split('.')[0];
checks.push({
  name: `Node ${wanted}.x (.nvmrc)`,
  pass: nodeMajor === wanted,
  detail: `found v${process.versions.node}`,
});

// npm
const npmVersion = tryExec('npm --version');
checks.push({
  name: 'npm available',
  pass: npmVersion !== null,
  detail: npmVersion ? `v${npmVersion}` : 'not found on PATH',
});

// git
const gitVersion = tryExec('git --version');
checks.push({
  name: 'git available',
  pass: gitVersion !== null,
  detail: gitVersion ?? 'not found on PATH',
});

// node_modules installed
checks.push({
  name: 'dependencies installed',
  pass: existsSync(join(ROOT, 'node_modules')),
  detail: existsSync(join(ROOT, 'node_modules'))
    ? 'node_modules present'
    : 'run npm install',
});

// wrangler login state (optional — only needed for deploys)
const whoami = tryExec('npx wrangler whoami');
const loggedIn = whoami !== null && !/not authenticated|You are not/i.test(whoami);
checks.push({
  name: 'wrangler login (deploys only)',
  pass: loggedIn,
  detail: loggedIn ? 'authenticated' : 'run `npx wrangler login` before deploying',
  optional: true,
});

const width = Math.max(...checks.map((c) => c.name.length)) + 2;
console.log('\nfeature-cards doctor\n');
let failed = false;
for (const check of checks) {
  const mark = check.pass ? ok('PASS') : check.optional ? dim('SKIP') : bad('FAIL');
  console.log(`  ${mark}  ${check.name.padEnd(width)} ${dim(check.detail)}`);
  if (!check.pass && !check.optional) {
    failed = true;
  }
}
console.log('');
process.exit(failed ? 1 : 0);
