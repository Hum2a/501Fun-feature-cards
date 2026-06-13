/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { JSX } from 'react';
import { useEffect, useRef, type CSSProperties } from 'react';
import { defineFeatureCards } from '../feature-cards.js';
import type { FeatureCardsElement } from '../feature-cards.js';
import type { AdapterName } from '../adapters/index.js';
import type { Card, FeatureCardsData } from '../schema.js';
import type { FeatureCardsErrorDetail } from '../errors.js';

defineFeatureCards();

/** React props for the `<FeatureCards />` wrapper. */
export interface FeatureCardsProps {
  src?: string;
  adapter?: AdapterName;
  data?: FeatureCardsData;
  columns?: number;
  heading?: string;
  headingLevel?: number;
  theme?: string;
  className?: string;
  style?: CSSProperties;
  onReady?: (detail: { count: number }) => void;
  onError?: (detail: FeatureCardsErrorDetail) => void;
  onCardClick?: (detail: { id: string; card: Card }) => void;
}

/**
 * React wrapper around `<feature-cards>`.
 */
export function FeatureCards({
  src,
  adapter,
  data,
  columns,
  heading,
  headingLevel,
  theme,
  className,
  style,
  onReady,
  onError,
  onCardClick,
}: FeatureCardsProps): JSX.Element {
  const ref = useRef<FeatureCardsElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || data === undefined) {
      return;
    }
    el.data = data;
  }, [data]);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const readyHandler = (event: Event): void => {
      onReady?.((event as CustomEvent<{ count: number }>).detail);
    };
    const errorHandler = (event: Event): void => {
      onError?.((event as CustomEvent<FeatureCardsErrorDetail>).detail);
    };
    const clickHandler = (event: Event): void => {
      onCardClick?.((event as CustomEvent<{ id: string; card: Card }>).detail);
    };

    if (onReady) {
      el.addEventListener('featurecards:ready', readyHandler);
    }
    if (onError) {
      el.addEventListener('featurecards:error', errorHandler);
    }
    if (onCardClick) {
      el.addEventListener('featurecards:cardclick', clickHandler);
    }

    return () => {
      if (onReady) {
        el.removeEventListener('featurecards:ready', readyHandler);
      }
      if (onError) {
        el.removeEventListener('featurecards:error', errorHandler);
      }
      if (onCardClick) {
        el.removeEventListener('featurecards:cardclick', clickHandler);
      }
    };
  }, [onReady, onError, onCardClick]);

  return (
    <feature-cards
      ref={ref}
      {...(src ? { src } : {})}
      {...(adapter ? { adapter } : {})}
      {...(columns !== undefined ? { columns: String(columns) } : {})}
      {...(heading ? { heading } : {})}
      {...(headingLevel !== undefined ? { 'heading-level': String(headingLevel) } : {})}
      {...(theme ? { theme } : {})}
      {...(className ? { class: className } : {})}
      {...(style ? { style: style as Record<string, string> } : {})}
    />
  );
}

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- JSX intrinsic for <feature-cards>
  namespace JSX {
    interface IntrinsicElements {
      'feature-cards': React.DetailedHTMLProps<
        React.HTMLAttributes<FeatureCardsElement>,
        FeatureCardsElement
      > & {
        src?: string;
        adapter?: string;
        heading?: string;
        'heading-level'?: string;
        columns?: string;
        theme?: string;
      };
    }
  }
}
