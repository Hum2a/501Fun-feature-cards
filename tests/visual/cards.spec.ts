/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of feature-cards, licensed under the GNU Affero
 * General Public License v3.0 only. See LICENSE for full terms.
 */
import { expect, test, type Page } from '@playwright/test';

test.beforeEach(({ browserName }) => {
  test.skip(browserName !== 'chromium', 'Visual baselines are pinned to Chromium on Windows');
});

async function waitForInline(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const el = document.querySelector('#inline-instance');
    return Boolean(el?.shadowRoot?.querySelector('.card'));
  });
  await page.evaluate(() => {
    document.documentElement.dataset.pageTheme = 'corporate-daydream';
  });
  await page.evaluate(() => document.fonts.ready);
}

// The inline instance shows all three built-in themes (blue, green, amber)
// in one frame, so each width baseline also covers the theme set.
for (const [label, width] of [
  ['small', 420],
  ['medium', 760],
  ['large', 1280],
] as const) {
  test(`inline cards at ${label} container width`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1400 });
    await page.goto('/');
    await waitForInline(page);
    await expect(page.locator('#inline-instance')).toHaveScreenshot(
      `inline-cards-${label}.png`,
    );
  });
}

test('host-level theme attribute restyles every card', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 1400 });
  await page.goto('/');
  await waitForInline(page);
  await page.evaluate(() => {
    document.querySelector('#light-dom-instance')?.setAttribute('theme', 'brand-green');
    // Per-card themes win over the host theme, so clear them for this shot.
    document
      .querySelector('#light-dom-instance')
      ?.shadowRoot?.querySelectorAll('.card')
      .forEach((card) => card.removeAttribute('data-theme'));
  });
  await expect(page.locator('#light-dom-instance')).toHaveScreenshot(
    'host-theme-green.png',
  );
});
