/*!
 * @techystuff/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of feature-cards, licensed under the GNU Affero
 * General Public License v3.0 only. See LICENSE for full terms.
 */
import type { FeatureCardsData } from '../schema.js';
import { toFeatureCardsData as generic } from './generic.js';
import { toFeatureCardsData as wordpress } from './wordpress.js';
import { toFeatureCardsData as contentful } from './contentful.js';
import { toFeatureCardsData as sanity } from './sanity.js';

/** An adapter reshapes an arbitrary CMS payload into the canonical schema. */
export type Adapter = (payload: unknown) => FeatureCardsData;

/** Names of the built-in adapters. */
export type AdapterName = 'generic' | 'wordpress' | 'contentful' | 'sanity';

const registry: Record<AdapterName, Adapter> = {
  generic,
  wordpress,
  contentful,
  sanity,
};

/**
 * Look up an adapter by name. Unknown or missing names fall back to the
 * generic adapter, so `<feature-cards src="...">` works without an
 * `adapter` attribute.
 */
export function getAdapter(name?: string | null): Adapter {
  if (name && name in registry) {
    return registry[name as AdapterName];
  }
  return registry.generic;
}

export { generic, wordpress, contentful, sanity };
