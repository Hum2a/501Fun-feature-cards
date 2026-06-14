/*!
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of feature-cards, licensed under the GNU Affero
 * General Public License v3.0 only. See LICENSE for full terms.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { adoptStyles, componentCss } from '@src/styles.js';

function freshShadowRoot(): ShadowRoot {
  const host = document.createElement('div');
  document.body.append(host);
  return host.attachShadow({ mode: 'open' });
}

afterEach(() => {
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
});

describe('adoptStyles', () => {
  it('falls back to a <style> element when constructable sheets fail', () => {
    class ThrowingSheet {
      replaceSync(): void {
        throw new Error('not supported');
      }
    }
    vi.stubGlobal('CSSStyleSheet', ThrowingSheet);
    const root = freshShadowRoot();
    adoptStyles(root);
    const style = root.querySelector('style');
    expect(style).not.toBeNull();
    expect(style?.textContent).toBe(componentCss);
  });

  it('adopts a shared constructable stylesheet when supported', () => {
    const root = freshShadowRoot();
    adoptStyles(root);
    const other = freshShadowRoot();
    adoptStyles(other);
    expect(root.adoptedStyleSheets.length).toBeGreaterThan(0);
    // The sheet is cached and shared between roots.
    expect(other.adoptedStyleSheets[0]).toBe(root.adoptedStyleSheets[0]);
  });
});

describe('componentCss tokens', () => {
  it('exposes the documented public token layer', () => {
    for (const token of [
      '--fc-font',
      '--fc-accent',
      '--fc-card-bg',
      '--fc-card-min',
      '--fc-gap',
      '--fc-radius',
      '--fc-ring',
    ]) {
      expect(componentCss).toContain(token);
    }
  });

  it('uses container queries, not viewport media queries, for layout', () => {
    expect(componentCss).toContain('container-type: inline-size');
    expect(componentCss).toContain('@container');
  });

  it('disables motion unless the user allows it', () => {
    expect(componentCss).toContain('prefers-reduced-motion: no-preference');
  });
});
