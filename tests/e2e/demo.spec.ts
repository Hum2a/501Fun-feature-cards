/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of feature-cards, licensed under the GNU Affero
 * General Public License v3.0 only. See LICENSE for full terms.
 */
import { expect, test, type Page } from '@playwright/test';

async function waitForAllInstances(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const instances = [...document.querySelectorAll('feature-cards')];
    return (
      instances.length > 0 &&
      instances.every((el) => el.shadowRoot?.querySelector('.section'))
    );
  });
}

test.describe('demo instances', () => {
  test('all three instantiation modes render cards', async ({ page }) => {
    await page.goto('/');
    await waitForAllInstances(page);

    await expect(page.locator('#inline-instance .card')).toHaveCount(3);
    await expect(page.locator('#light-dom-instance .card')).toHaveCount(3);
    await expect(page.locator('#cms-instance .card')).toHaveCount(3);
  });

  test('src-driven instance consumed JSON over HTTP', async ({ page }) => {
    await page.goto('/');
    await waitForAllInstances(page);
    const src = await page.locator('#cms-instance').getAttribute('src');
    expect(src).toBeTruthy();
    await expect(
      page.locator('#cms-instance .heading', { hasText: 'Fetched from the mock CMS' }),
    ).toBeVisible();
  });
});

test.describe('keyboard interaction', () => {
  test('cards are reachable and activatable by keyboard', async ({ page, browserName }) => {
    await page.goto('/');
    await waitForAllInstances(page);

    const firstCard = page.locator('#inline-instance a.link').first();
    const secondCard = page.locator('#inline-instance a.link').nth(1);
    await firstCard.focus();
    await expect(firstCard).toBeFocused();

    // Tab order differs slightly in WebKit with many demo controls — still must be focusable.
    if (browserName === 'chromium') {
      await page.keyboard.press('Tab');
      await expect(secondCard).toBeFocused();
    } else {
      await secondCard.focus();
      await expect(secondCard).toBeFocused();
    }

    // Activation emits the public cardclick event with the card id.
    const detail = page.evaluate(
      () =>
        new Promise<{ id: string }>((resolve) => {
          document.addEventListener(
            'featurecards:cardclick',
            (event) => resolve((event as CustomEvent).detail),
            { once: true },
          );
        }),
    );
    await firstCard.focus();
    await page.keyboard.press('Enter');
    expect((await detail).id).toBe('satisfaction');
  });
});

test.describe('container responsiveness', () => {
  test('resizing the container (not the viewport) reflows the grid', async ({ page }) => {
    await page.goto('/');
    await waitForAllInstances(page);

    const trackCount = () =>
      page.evaluate(() => {
        const el = document.querySelector('#resizable-instance');
        const grid = el?.shadowRoot?.querySelector('.grid');
        return grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').length : 0;
      });

    await page.evaluate(() => {
      const box = document.querySelector<HTMLElement>('#resizable');
      if (box) box.style.width = '900px';
    });
    const wide = await trackCount();

    await page.evaluate(() => {
      const box = document.querySelector<HTMLElement>('#resizable');
      if (box) box.style.width = '320px';
    });
    const narrow = await trackCount();

    expect(wide).toBeGreaterThan(narrow);
    expect(narrow).toBe(1);
  });
});

test.describe('reduced motion', () => {
  test('transitions are disabled under prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await waitForAllInstances(page);

    const duration = await page.evaluate(() => {
      const el = document.querySelector('#inline-instance');
      const card = el?.shadowRoot?.querySelector('.card');
      return card ? getComputedStyle(card).transitionDuration : null;
    });
    expect(duration).toBe('0s');
  });
});
