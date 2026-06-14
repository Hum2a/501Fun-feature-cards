/*!
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of feature-cards, licensed under the GNU Affero
 * General Public License v3.0 only. See LICENSE for full terms.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CANARY_UUID,
  FeatureCardsElement,
  defineFeatureCards,
  type FeatureCardsData,
} from '@src/index.js';

const VALID_DATA: FeatureCardsData = {
  heading: 'Test heading',
  cards: [
    {
      id: 'one',
      eyebrow: 'Eyebrow',
      title: 'First card',
      description: 'Description one',
      figure: { value: '97%', label: 'satisfaction', trend: 'up' },
      cta: { label: 'Go', href: '/one' },
      theme: 'brand-blue',
    },
    {
      id: 'two',
      title: 'Second card',
      media: { src: '/img.png', alt: 'Meaningful alt' },
      cta: { label: 'Go two', href: '/two', ariaLabel: 'Go to two' },
    },
  ],
};

function mount(innerHtml = '', attrs: Record<string, string> = {}): FeatureCardsElement {
  const el = document.createElement('feature-cards');
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  el.innerHTML = innerHtml;
  document.body.append(el);
  return el;
}

function nextTick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

afterEach(() => {
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
});

describe('registration', () => {
  it('registers <feature-cards> exactly once and tolerates repeat calls', () => {
    expect(customElements.get('feature-cards')).toBe(FeatureCardsElement);
    expect(() => {
      defineFeatureCards();
      defineFeatureCards();
    }).not.toThrow();
  });
});

describe('data sources', () => {
  it('renders from the data property', async () => {
    const el = mount();
    el.data = VALID_DATA;
    await nextTick();
    const titles = [...el.shadowRoot!.querySelectorAll('.title')].map(
      (n) => n.textContent,
    );
    expect(titles).toEqual(['First card', 'Second card']);
    expect(el.shadowRoot!.querySelector('.heading')?.textContent).toBe('Test heading');
  });

  it('renders from an inline JSON script child', async () => {
    const el = mount(
      `<script type="application/json">${JSON.stringify(VALID_DATA)}</script>`,
    );
    await nextTick();
    expect(el.shadowRoot!.querySelectorAll('.card')).toHaveLength(2);
  });

  it('emits an error for malformed inline JSON', async () => {
    const onError = vi.fn();
    document.addEventListener('featurecards:error', onError, { once: true });
    mount(`<script type="application/json">{not json…</script>`);
    await nextTick();
    expect(onError).toHaveBeenCalledOnce();
  });

  it('fetches from src and applies the named adapter', async () => {
    const wpPayload = [
      {
        id: 7,
        link: 'https://example.com/post/',
        title: { rendered: 'Fetched post' },
      },
    ];
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => wpPayload })),
    );
    const el = mount('', { src: '/api/cards', adapter: 'wordpress' });
    await nextTick();
    expect(el.shadowRoot!.querySelector('.title')?.textContent).toBe('Fetched post');
  });

  it('emits an error when the src fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 500 })),
    );
    const onError = vi.fn();
    document.addEventListener('featurecards:error', onError, { once: true });
    mount('', { src: '/api/cards' });
    await nextTick();
    expect(onError).toHaveBeenCalledOnce();
    const detail = (onError.mock.calls[0]![0] as CustomEvent).detail;
    expect(detail.issues[0].path).toBe('src');
  });

  it('progressively enhances light-DOM links', async () => {
    const el = mount(
      `<a id="docs" href="/docs" data-eyebrow="Guides" data-description="All the docs" data-theme="brand-green">Read the docs</a>`,
    );
    await nextTick();
    const link = el.shadowRoot!.querySelector<HTMLAnchorElement>('.link');
    expect(link?.getAttribute('href')).toBe('/docs');
    expect(el.shadowRoot!.querySelector('.title')?.textContent).toBe('Read the docs');
    expect(el.shadowRoot!.querySelector('.eyebrow')?.textContent).toBe('Guides');
    expect(el.shadowRoot!.querySelector('.card')?.getAttribute('data-theme')).toBe(
      'brand-green',
    );
  });

  it('gives the data property precedence over inline JSON', async () => {
    const el = mount(
      `<script type="application/json">${JSON.stringify({
        cards: [{ id: 'inline', title: 'Inline wins?' }],
      })}</script>`,
    );
    el.data = VALID_DATA;
    await nextTick();
    expect(el.shadowRoot!.querySelector('.title')?.textContent).toBe('First card');
  });

  it('keeps the fallback slot when no data source exists', async () => {
    const el = mount();
    await nextTick();
    expect(el.shadowRoot!.querySelector('slot')).not.toBeNull();
    expect(el.shadowRoot!.querySelector('.section')).toBeNull();
  });

  it('setting data to undefined does not render or throw', async () => {
    const el = mount();
    el.data = undefined;
    await nextTick();
    expect(el.shadowRoot!.querySelector('.section')).toBeNull();
    expect(el.data).toBeUndefined();
  });

  it('starts fetching when src is set after connection', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ cards: [{ id: 'late', title: 'Late fetch' }] }),
      })),
    );
    const el = mount();
    await nextTick();
    el.setAttribute('src', '/api/late');
    await nextTick();
    expect(el.shadowRoot!.querySelector('.title')?.textContent).toBe('Late fetch');
  });

  it('aborts an in-flight fetch on disconnect without emitting an error', async () => {
    const onError = vi.fn();
    document.addEventListener('featurecards:error', onError);
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: { signal: AbortSignal }) =>
          new Promise((_resolve, reject) => {
            init.signal.addEventListener('abort', () =>
              reject(Object.assign(new Error('aborted'), { name: 'AbortError' })),
            );
          }),
      ),
    );
    const el = mount('', { src: '/api/slow' });
    await nextTick();
    el.remove();
    await nextTick();
    expect(onError).not.toHaveBeenCalled();
    document.removeEventListener('featurecards:error', onError);
  });
});

describe('fail-safe behaviour', () => {
  it('emits featurecards:error with issues and renders nothing destructive', async () => {
    const onError = vi.fn();
    document.addEventListener('featurecards:error', onError, { once: true });
    const el = mount('<a href="/keep-me">Keep me</a>');
    el.data = { cards: [{ id: 'x' }] } as unknown as FeatureCardsData;
    await nextTick();
    expect(onError).toHaveBeenCalledOnce();
    const detail = (onError.mock.calls[0]![0] as CustomEvent).detail;
    expect(detail.issues.length).toBeGreaterThan(0);
    expect(detail.problem?.type).toContain('validation-failed');
    // Light DOM is untouched and still slotted.
    expect(el.querySelector('a')?.getAttribute('href')).toBe('/keep-me');
  });

  it('never throws when given garbage via the property', () => {
    const el = mount();
    expect(() => {
      el.data = 42 as unknown as FeatureCardsData;
    }).not.toThrow();
  });
});

describe('events', () => {
  it('emits featurecards:ready with the card count', async () => {
    const onReady = vi.fn();
    document.addEventListener('featurecards:ready', onReady, { once: true });
    const el = mount();
    el.data = VALID_DATA;
    await nextTick();
    expect(onReady).toHaveBeenCalledOnce();
    expect((onReady.mock.calls[0]![0] as CustomEvent).detail).toEqual({ count: 2 });
  });

  it('emits featurecards:cardclick with the card id on activation', async () => {
    const onClick = vi.fn();
    document.addEventListener('featurecards:cardclick', onClick, { once: true });
    const el = mount();
    el.data = VALID_DATA;
    await nextTick();
    const link = el.shadowRoot!.querySelector<HTMLAnchorElement>('.link');
    link?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onClick).toHaveBeenCalledOnce();
    const detail = (onClick.mock.calls[0]![0] as CustomEvent).detail;
    expect(detail.id).toBe('one');
    expect(detail.card.title).toBe('First card');
  });
});

describe('attributes', () => {
  it('caps columns via the --fc-cols custom property, clamped to 1–6', async () => {
    const el = mount('', { columns: '2' });
    await nextTick();
    expect(el.style.getPropertyValue('--fc-cols')).toBe('2');
    el.setAttribute('columns', '99');
    expect(el.style.getPropertyValue('--fc-cols')).toBe('6');
    el.removeAttribute('columns');
    expect(el.style.getPropertyValue('--fc-cols')).toBe('');
  });

  it('honours heading-level for section and card headings', async () => {
    const el = mount('', { 'heading-level': '4' });
    el.data = VALID_DATA;
    await nextTick();
    expect(el.shadowRoot!.querySelector('h4.heading')).not.toBeNull();
    expect(el.shadowRoot!.querySelector('h5.title')).not.toBeNull();
  });

  it('re-renders when the heading attribute changes', async () => {
    const el = mount();
    el.data = VALID_DATA;
    await nextTick();
    el.setAttribute('heading', 'Overridden');
    await nextTick();
    expect(el.shadowRoot!.querySelector('.heading')?.textContent).toBe('Overridden');
  });

  it('ignores heading changes before anything has rendered', async () => {
    const el = mount();
    await nextTick();
    el.setAttribute('heading', 'Too early');
    await nextTick();
    expect(el.shadowRoot!.querySelector('.section')).toBeNull();
  });

  it('defaults to level 2 for invalid heading-level values', async () => {
    const el = mount('', { 'heading-level': 'banana' });
    el.data = VALID_DATA;
    await nextTick();
    expect(el.shadowRoot!.querySelector('h2.heading')).not.toBeNull();
    expect(el.shadowRoot!.querySelector('h3.title')).not.toBeNull();
  });

  it('ignores attribute changes while disconnected', async () => {
    const el = mount();
    el.data = VALID_DATA;
    await nextTick();
    el.remove();
    expect(() => el.setAttribute('columns', '3')).not.toThrow();
  });

  it('renders icon media as decorative', async () => {
    const el = mount();
    el.data = {
      cards: [{ id: 'icon-card', title: 'Iconic', media: { icon: '★' } }],
    };
    await nextTick();
    const icon = el.shadowRoot!.querySelector('.media .icon');
    expect(icon?.textContent).toBe('★');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders a minimal card without optional fields', async () => {
    const el = mount();
    el.data = { cards: [{ id: 'min', title: 'Bare minimum' }] };
    await nextTick();
    const link = el.shadowRoot!.querySelector<HTMLAnchorElement>('.link');
    expect(link?.getAttribute('href')).toBe('#');
    expect(el.shadowRoot!.querySelector('.description')).toBeNull();
    expect(el.shadowRoot!.querySelector('.figure')).toBeNull();
    expect(el.shadowRoot!.querySelector('.cta')).toBeNull();
    // No heading in data and no heading attribute → empty heading slot.
    expect(el.shadowRoot!.querySelector('.heading')).toBeNull();
  });
});

describe('accessibility details', () => {
  it('hides decorative images and keeps meaningful alt text', async () => {
    const el = mount();
    el.data = {
      cards: [
        { id: 'a', title: 'Decorative', media: { src: '/d.png', alt: '' } },
        { id: 'b', title: 'Meaningful', media: { src: '/m.png', alt: 'A real chart' } },
      ],
    };
    await nextTick();
    const imgs = [...el.shadowRoot!.querySelectorAll('img')];
    expect(imgs[0]?.getAttribute('aria-hidden')).toBe('true');
    expect(imgs[1]?.getAttribute('aria-hidden')).toBeNull();
    expect(imgs[1]?.getAttribute('alt')).toBe('A real chart');
  });

  it('announces figure trends via visually-hidden text', async () => {
    const el = mount();
    el.data = VALID_DATA;
    await nextTick();
    const hidden = el.shadowRoot!.querySelector('.figure .visually-hidden');
    expect(hidden?.textContent).toContain('increased');
  });

  it('applies an aria-label when the cta provides one', async () => {
    const el = mount();
    el.data = VALID_DATA;
    await nextTick();
    const links = [...el.shadowRoot!.querySelectorAll('.link')];
    expect(links[1]?.getAttribute('aria-label')).toBe('Go to two');
  });
});

describe('stat layout (501 module)', () => {
  const STAT_DATA: FeatureCardsData = {
    cards: [
      {
        id: 'guests',
        layout: 'stat',
        eyebrow: 'More than',
        figure: { value: '12,000,000', label: 'delighted guests' },
        media: { src: '/icons/lucide/users.svg', alt: '' },
        appearance: {
          background: '#c6f135',
          rotateDeg: 5,
          scale: 1.05,
          minHeight: '18rem',
        },
      },
    ],
  };

  it('renders top → figure → media in stat layout', async () => {
    const el = mount();
    el.data = STAT_DATA;
    await nextTick();
    const link = el.shadowRoot!.querySelector('[data-layout="stat"] .link');
    expect(link).toBeTruthy();
    const parts = [...link!.children].map((node) => node.className);
    expect(parts).toEqual(['eyebrow', 'figure', 'media']);
  });

  it('sets aria-label from eyebrow and figure when no CTA label', async () => {
    const el = mount();
    el.data = STAT_DATA;
    await nextTick();
    const link = el.shadowRoot!.querySelector('[data-layout="stat"] .link');
    expect(link?.getAttribute('aria-label')).toBe(
      'More than 12,000,000 delighted guests',
    );
  });

  it('maps appearance to CSS variables and transform', async () => {
    const el = mount();
    el.data = STAT_DATA;
    await nextTick();
    const item = el.shadowRoot!.querySelector('[data-layout="stat"]') as HTMLLIElement;
    expect(item.style.getPropertyValue('--fc-card-bg')).toBe('#c6f135');
    expect(item.style.getPropertyValue('--fc-stat-min-height')).toBe('18rem');
    expect(item.style.transform).toContain('rotate(5deg)');
    expect(item.style.transform).toContain('scale(1.05)');
  });

  it('maps icon size to --fc-stat-media-max', async () => {
    const el = mount();
    el.data = {
      cards: [
        {
          ...STAT_DATA.cards[0]!,
          appearance: {
            ...STAT_DATA.cards[0]!.appearance,
            mediaMaxHeight: '10rem',
          },
        },
      ],
    };
    await nextTick();
    const item = el.shadowRoot!.querySelector('[data-layout="stat"]') as HTMLLIElement;
    expect(item.style.getPropertyValue('--fc-stat-media-max')).toBe('10rem');
  });
});

describe('watermark integration', () => {
  it('embeds the provenance comment and zero-width signature', async () => {
    const el = mount();
    el.data = VALID_DATA;
    await nextTick();
    const comment = [...el.shadowRoot!.childNodes].find(
      (n) => n.nodeType === Node.COMMENT_NODE,
    );
    expect(comment?.textContent).toContain(CANARY_UUID);
    const section = el.shadowRoot!.querySelector('.section');
    expect(section?.getAttribute('data-fc-sig')).toBeTruthy();
  });

  it('exposes a non-enumerable provenance property on the class', async () => {
    const el = mount();
    el.data = VALID_DATA;
    await nextTick();
    type WithProvenance = typeof FeatureCardsElement & {
      __FEATURE_CARDS_PROVENANCE__?: { uuid: string };
    };
    const klass = FeatureCardsElement as WithProvenance;
    expect(klass.__FEATURE_CARDS_PROVENANCE__?.uuid).toBe(CANARY_UUID);
    expect(Object.keys(FeatureCardsElement)).not.toContain(
      '__FEATURE_CARDS_PROVENANCE__',
    );
    expect(el.provenance.uuid).toBe(CANARY_UUID);
  });
});
