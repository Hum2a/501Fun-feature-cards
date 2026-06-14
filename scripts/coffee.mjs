#!/usr/bin/env node
/*!
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// ASCII coffee + a rotating dev quip. Vital infrastructure.

const quips = [
  'Shadow DOM: because your CSS deserves boundaries.',
  'It works without JavaScript. Yes, really.',
  'Container queries asked the container. Revolutionary.',
  'AGPL: sharing is caring, legally enforceable edition.',
  'Ship the schema, not the framework.',
  'alt="" is a decision, not an omission.',
];

const cup = String.raw`
      ( (
       ) )
    ........
    |      |]
    \      /
     '----'
`;

console.log(
  `\u001B[38;5;180m${cup}\u001B[0m  ${quips[Math.floor(Math.random() * quips.length)]}\n`,
);
