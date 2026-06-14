/*!
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { afterEach, describe, expect, it } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import { FeatureCards } from '@src/react/index.js';

describe('FeatureCards React wrapper', () => {
  let host: HTMLDivElement;
  let root: Root;

  afterEach(() => {
    act(() => root?.unmount());
    host?.remove();
  });

  it('renders a custom element with card data', async () => {
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);

    await act(async () => {
      root.render(
        <FeatureCards
          data={{
            cards: [
              {
                id: 'react-smoke',
                title: 'From React',
                cta: { label: 'Go', href: '/go' },
              },
            ],
          }}
        />,
      );
    });

    await customElements.whenDefined('feature-cards');
    await act(async () => {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });

    const el = host.querySelector('feature-cards');
    expect(el).not.toBeNull();
    expect(el?.shadowRoot?.querySelector('.title')?.textContent).toBe('From React');
  });
});
