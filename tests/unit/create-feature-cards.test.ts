/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';
import { createFeatureCards } from '@src/create-feature-cards.js';
import { defineFeatureCards } from '@src/feature-cards.js';

describe('createFeatureCards', () => {
  it('mounts an element and renders inline data', async () => {
    defineFeatureCards();
    const host = document.createElement('div');
    document.body.append(host);

    const el = createFeatureCards({
      target: host,
      data: { cards: [{ id: 'a', title: 'Created imperatively' }] },
    });

    await customElements.whenDefined('feature-cards');
    await new Promise((r) => requestAnimationFrame(r));

    expect(el.shadowRoot?.querySelector('.title')?.textContent).toBe(
      'Created imperatively',
    );
    host.remove();
  });

  it('throws when the target selector misses', () => {
    defineFeatureCards();
    expect(() => createFeatureCards({ target: '#missing-host-xyz' })).toThrow(
      /no element/,
    );
  });

  it('applies attributes and wires event callbacks', async () => {
    defineFeatureCards();
    const host = document.createElement('div');
    host.id = 'imperative-host';
    document.body.append(host);

    const ready = vi.fn();
    const error = vi.fn();
    const click = vi.fn();

    const el = createFeatureCards({
      target: '#imperative-host',
      src: '/api/cards',
      adapter: 'wordpress',
      heading: 'Features',
      headingLevel: 3,
      columns: 2,
      theme: 'brand-green',
      data: {
        cards: [
          {
            id: 'b',
            title: 'With CTA',
            cta: { label: 'Learn more', href: '/learn' },
          },
        ],
      },
      onReady: ready,
      onError: error,
      onCardClick: click,
    });

    await customElements.whenDefined('feature-cards');
    await new Promise((r) => requestAnimationFrame(r));

    expect(el.getAttribute('src')).toBe('/api/cards');
    expect(el.getAttribute('adapter')).toBe('wordpress');
    expect(el.getAttribute('heading')).toBe('Features');
    expect(el.getAttribute('heading-level')).toBe('3');
    expect(el.getAttribute('columns')).toBe('2');
    expect(el.getAttribute('theme')).toBe('brand-green');

    el.dispatchEvent(new CustomEvent('featurecards:ready', { detail: { count: 1 } }));
    el.dispatchEvent(
      new CustomEvent('featurecards:error', {
        detail: {
          issues: [{ path: 'cards', message: 'bad' }],
          problem: { type: 'x', title: 'y', issues: [] },
        },
      }),
    );
    el.dispatchEvent(
      new CustomEvent('featurecards:cardclick', {
        detail: { id: 'b', card: { id: 'b', title: 'With CTA' } },
      }),
    );

    expect(ready).toHaveBeenCalledWith({ count: 1 });
    expect(error).toHaveBeenCalled();
    expect(click).toHaveBeenCalledWith(expect.objectContaining({ id: 'b' }));

    host.remove();
  });
});
