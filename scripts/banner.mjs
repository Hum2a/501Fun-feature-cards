#!/usr/bin/env node
/*!
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// Gradient ASCII banner. Silent in CI; --quiet keeps postinstall to one line.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

if (process.env.CI) {
  process.exit(0);
}

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const quiet = process.argv.includes('--quiet');

const ART = String.raw`
 ______        _                    _____              _
|  ____|      | |                  / ____|            | |
| |__ ___  ___| |_ _   _ _ __ ___ | |     __ _ _ __ __| |___
|  __/ _ \/ _ \ __| | | | '__/ _ \| |    / _' | '__/ _' / __|
| | |  __/  __/ |_| |_| | | |  __/| |___| (_| | | | (_| \__ \
|_|  \___|\___|\__|\__,_|_|  \___| \_____\__,_|_|  \__,_|___/
`;

/** Apply a horizontal blue→green→amber gradient with raw ANSI 256 colours. */
function gradient(text) {
  const stops = [33, 39, 44, 49, 42, 35, 178, 214];
  return text
    .split('\n')
    .map((line) => {
      const width = Math.max(line.length, 1);
      let out = '';
      for (let i = 0; i < line.length; i += 1) {
        const stop = stops[Math.floor((i / width) * stops.length)] ?? 214;
        out += `\u001B[38;5;${stop}m${line[i]}`;
      }
      return `${out}\u001B[0m`;
    })
    .join('\n');
}

if (quiet) {
  console.log(
    `\u001B[38;5;44m<feature-cards>\u001B[0m v${pkg.version} installed — AGPL-3.0-only · run \u001B[1mnpm run banner\u001B[0m for the full splash`,
  );
} else {
  console.log(gradient(ART));
  console.log(
    `  \u001B[1mv${pkg.version}\u001B[0m · AGPL-3.0-only · © 2026 Humza Butt · CMS-agnostic <feature-cards>\n`,
  );
}
