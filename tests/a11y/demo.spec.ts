/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of feature-cards, licensed under the GNU Affero
 * General Public License v3.0 only. See LICENSE for full terms.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('accessibility', () => {
  test('demo page (including shadow DOM) has zero axe violations', async ({ page }) => {
    await page.goto('/');
    // Wait until every <feature-cards> instance has rendered its section.
    await page.waitForFunction(() => {
      const instances = [...document.querySelectorAll('feature-cards')];
      return (
        instances.length > 0 &&
        instances.every((el) => el.shadowRoot?.querySelector('.section'))
      );
    });

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test('cards expose accessible names and real headings', async ({ page }) => {
    await page.goto('/');
    const inline = page.locator('#inline-instance');
    await expect(
      inline.locator('a.link', { hasText: 'Satisfaction that sticks' }),
    ).toBeVisible();
    // Section heading level is configurable; the demo nests it as h3 → h4 titles.
    await expect(inline.locator('h3.heading')).toHaveText('Why teams choose us');
    await expect(inline.locator('h4.title')).toHaveCount(3);
  });
});
