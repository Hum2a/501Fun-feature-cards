/*!
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
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

  test('cards expose accessible names and stat layout content', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => {
      const el = document.querySelector('#inline-instance');
      return Boolean(el?.shadowRoot?.querySelector('[data-layout="stat"]'));
    });
    const inline = page.locator('#inline-instance');
    await expect(inline.locator('[data-layout="stat"]')).toHaveCount(3);
    await expect(inline.locator('h3.heading')).toHaveText('Why teams choose us');
    await expect(inline.locator('a.link').first()).toHaveAttribute(
      'aria-label',
      'More than 12,000,000 delighted guests',
    );
    await expect(inline.locator('.figure-value').first()).toHaveText('12,000,000');
  });
});
