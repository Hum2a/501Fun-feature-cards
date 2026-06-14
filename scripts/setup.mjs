#!/usr/bin/env node
/*!
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// One-shot onboarding for new contributors: env templates, deps, tooling, build artefacts.

import { copyFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

const args = new Set(process.argv.slice(2));
const quick = args.has('--quick');
const skipInstall = args.has('--skip-install');
const skipBrowsers = args.has('--skip-browsers') || quick;
const skipBuild = args.has('--skip-build') || quick;

const bold = (s) => `\u001B[1m${s}\u001B[0m`;
const dim = (s) => `\u001B[2m${s}\u001B[0m`;
const green = (s) => `\u001B[32m${s}\u001B[0m`;

function step(title) {
  console.log(`\n${bold(title)}`);
}

function run(cmd, { optional = false } = {}) {
  console.log(dim(`  $ ${cmd}`));
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
    return true;
  } catch {
    if (optional) {
      console.log(dim('  (optional step skipped — see message above)'));
      return false;
    }
    throw new Error(`Command failed: ${cmd}`);
  }
}

function copyIfMissing(relativeDest, relativeExample) {
  const dest = join(ROOT, relativeDest);
  const example = join(ROOT, relativeExample);
  if (existsSync(dest)) {
    console.log(`  ${dim('keep')}  ${relativeDest}`);
    return;
  }
  if (!existsSync(example)) {
    console.log(`  ${dim('skip')}  ${relativeExample} not found`);
    return;
  }
  copyFileSync(example, dest);
  console.log(`  ${green('create')}  ${relativeDest} ← ${relativeExample}`);
}

console.log(`\n${bold('feature-cards setup')}`);
console.log(
  dim(
    quick
      ? 'Quick mode: deps + env only (--quick). Use full setup before running tests.'
      : 'New contributor bootstrap — env, deps, agent rules, browsers, library build.',
  ),
);

step('1/7  Environment templates');
copyIfMissing('.env', '.env.example');
copyIfMissing('worker/.dev.vars', 'worker/.dev.vars.example');

step('2/7  Dependencies');
if (skipInstall) {
  console.log(dim('  skipped (--skip-install)'));
} else if (existsSync(join(ROOT, 'package-lock.json'))) {
  run('npm ci');
} else {
  run('npm install');
}

step('3/7  Agent rules mirror');
run('npm run rules:sync');

step('4/7  Lucide demo icons');
run('npm run icons:sync');

step('5/7  Playwright browsers (e2e + a11y)');
if (skipBrowsers) {
  console.log(dim('  skipped (--skip-browsers or --quick)'));
} else {
  run('npx playwright install --with-deps chromium webkit');
}

step('6/7  Library build (types, CEM, dist/)');
if (skipBuild) {
  console.log(dim('  skipped (--skip-build or --quick)'));
} else {
  run('npm run build:lib');
}

step('7/7  Toolchain doctor');
const doctorOk = run('npm run doctor', { optional: true });

console.log('');
if (doctorOk) {
  console.log(green('Setup complete.'));
} else {
  console.log(
    '\u001B[33mSetup finished with doctor warnings\u001B[0m — fix the items above before `npm run check`.',
  );
}
console.log(bold('Next steps'));
console.log('  npm run dev         demo → http://localhost:5173');
console.log(
  '  npm run serve:cms   mock CMS → http://localhost:8787/api/cards  (second terminal)',
);
console.log('  npm run check       full gate before opening a PR');
console.log('\n' + dim('Docs: CONTRIBUTING.md · docs/README.md · AGENTS.md'));
console.log(
  '\n' + dim('Flags: --quick  --skip-install  --skip-browsers  --skip-build') + '\n',
);

process.exit(doctorOk ? 0 : 1);
