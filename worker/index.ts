/*!
 * @humza/feature-cards — CMS-agnostic <feature-cards> Web Component
 * Copyright © 2026 Humza Butt. All rights reserved.
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of feature-cards, licensed under the GNU Affero
 * General Public License v3.0 only. See LICENSE for full terms.
 */

/**
 * Mock headless-CMS endpoint for the `<feature-cards>` demo.
 * Serves card JSON at GET /api/cards with CORS + cache headers, simulating
 * what a real CMS delivery API would return. OpenAPI at GET /openapi.json.
 */

import openApiSpec from '../docs/openapi/cms-api.json';

interface Env {
  /** Origin allowed by CORS; "*" by default for the public demo. */
  CORS_ORIGIN?: string;
}

const CARDS = {
  heading: 'Fetched from the mock CMS',
  cards: [
    {
      id: 'cms-uptime',
      eyebrow: 'Reliability',
      title: 'Always on',
      description:
        'Multi-region failover keeps your storefront available around the clock.',
      figure: { value: '99.99%', label: 'uptime last 12 months', trend: 'up' },
      cta: { label: 'Read the SLA', href: '#sla' },
      theme: 'brand-blue',
    },
    {
      id: 'cms-editors',
      eyebrow: 'Authoring',
      title: 'Editors love it',
      description: 'Change a CMS entry and the cards re-render — no designer round-trip.',
      figure: { value: '0', label: 'code changes per copy edit', trend: 'flat' },
      cta: { label: 'See the workflow', href: '#workflow' },
      theme: 'brand-green',
    },
    {
      id: 'cms-adapters',
      eyebrow: 'Portability',
      title: 'Bring any CMS',
      description:
        'WordPress, Contentful, Sanity, or anything else — one tiny adapter each.',
      figure: { value: '4', label: 'adapters built in', trend: 'up' },
      cta: { label: 'Browse adapters', href: '#adapters' },
      theme: 'brand-amber',
    },
  ],
};

function corsHeaders(env: Env): HeadersInit {
  return {
    'Access-Control-Allow-Origin': env.CORS_ORIGIN ?? '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    if (url.pathname === '/openapi.json' && request.method === 'GET') {
      return new Response(JSON.stringify(openApiSpec, null, 2), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...corsHeaders(env),
        },
      });
    }

    if (url.pathname === '/api/cards' && request.method === 'GET') {
      return new Response(JSON.stringify(CARDS, null, 2), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
          ...corsHeaders(env),
        },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders(env),
      },
    });
  },
};
