#!/usr/bin/env node
/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// Validate a remote CMS JSON payload against the canonical card schema.
//
// Usage:
//   node scripts/validate-cms-json.mjs https://cms.example.com/api/cards

import { z } from 'zod';

const cardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
});

const payloadSchema = z.object({
  heading: z.string().optional(),
  cards: z.array(cardSchema).min(1),
});

const url = process.argv[2];
if (!url) {
  console.error('Usage: node scripts/validate-cms-json.mjs <url>');
  process.exit(2);
}

const response = await fetch(url, { redirect: 'follow' });
if (!response.ok) {
  console.error(`HTTP ${response.status} from ${url}`);
  process.exit(1);
}

const payload = await response.json();
const result = payloadSchema.safeParse(payload);

if (!result.success) {
  console.error(`Invalid CMS payload from ${url}:`);
  for (const issue of result.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

console.log(`Valid CMS payload (${result.data.cards.length} cards) from ${url}`);
