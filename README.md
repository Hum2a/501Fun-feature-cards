# `<feature-cards>`

[![CI](https://github.com/Hum2a/feature-cards/actions/workflows/ci.yml/badge.svg)](https://github.com/Hum2a/feature-cards/actions/workflows/ci.yml)
[![License: AGPL-3.0-only](https://img.shields.io/badge/license-AGPL--3.0--only-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/@humza/feature-cards.svg)](https://www.npmjs.com/package/@humza/feature-cards)
[![Bundle size](https://img.shields.io/badge/ESM%20gzip-~25%20KiB-brightgreen.svg)](scripts/size.mjs)
[![Live demo](https://img.shields.io/badge/demo-501fun.humza--butt.space-2563eb.svg)](https://501fun.humza-butt.space)

**Package:** `@humza/feature-cards` · **Version:** `1.0.4`  
**Live demo:** [501fun.humza-butt.space](https://501fun.humza-butt.space) · **npm guide:** [docs/NPM.md](docs/NPM.md)  
**Documentation hub:** [docs/README.md](docs/README.md)

One **accessible, responsive, CMS-agnostic Web Component** that replaces hard-coded
feature-card images. Native browser APIs — Shadow DOM, container queries,
constructable stylesheets — authored in strict TypeScript, shipped as
zero-framework vanilla JS (~25 KiB gzip).

![Three themed feature cards rendered by the component](tests/visual/cards.spec.ts-snapshots/inline-cards-large-chromium-win32.png)

## Table of contents

- [Why this exists](#why-this-exists)
- [Quick start](#quick-start)
- [Install from npm](#install-from-npm)
- [Data model](#data-model)
- [Public API](#public-api)
- [CMS integration](#cms-integration)
- [Demo page themes and motion](#demo-page-themes-and-motion)
- [Accessibility](#accessibility)
- [Architecture & methodology](#architecture--methodology)
- [Development](#development)
- [Testing](#testing)
- [Releasing](#releasing)
- [Deployment](#deployment)
- [Documentation index](#documentation-index)
- [Licence](#licence)

## Why this exists

| You need… | This provides… |
| --- | --- |
| **501 landing-page stat cards** (replace designer PNGs) | `layout: "stat"` + live demo **card editor** |
| Edit top / middle / bottom / icon without a designer | Four-field schema + editor UI |
| Per-card colour, rotation, and size | `appearance` + `501-*` themes |
| Drop-in embed for any CMS | Custom Element + IIFE script tag |
| No framework lock-in | Vanilla JS core; optional React wrapper |
| Headless content | `src` fetch + WordPress / Contentful / Sanity adapters |
| No-JS fallback | Plain `<a>` children upgrade progressively |
| Style safety on unknown pages | Shadow DOM + `--fc-*` token theming API |
| Sidebar **and** full-width layouts | Container queries — not viewport breakpoints |
| Proof of quality | axe zero violations in CI; 90%+ unit coverage |

## Quick start

### Script tag (any CMS, no build step)

```html
<script src="https://cdn.jsdelivr.net/npm/@humza/feature-cards@1.0.4/dist/feature-cards.iife.js" defer></script>

<feature-cards heading="Why teams choose us">
  <script type="application/json">
    {
      "cards": [
        {
          "id": "satisfaction",
          "title": "Satisfaction that sticks",
          "figure": { "value": "97%", "label": "customer satisfaction", "trend": "up" },
          "cta": { "label": "Read customer stories", "href": "/customers" },
          "theme": "brand-blue"
        }
      ]
    }
  </script>
</feature-cards>
```

Pin versions and add SRI — see [WordPress cookbook](docs/cookbook/wordpress.md).

## Install from npm

```sh
npm install @humza/feature-cards
```

| Entry | Import |
| --- | --- |
| Web Component | `import '@humza/feature-cards'` |
| Imperative API | `import { createFeatureCards } from '@humza/feature-cards'` |
| React wrapper | `import { FeatureCards } from '@humza/feature-cards/react'` |
| Script tag (no build) | `@humza/feature-cards/iife` via CDN — see above |

**Licence:** [AGPL-3.0-only](LICENSE) — free for open/copyleft use. Closed-source
commercial deployment requires a [commercial licence](COMMERCIAL-LICENSING.md).

Publishing and dual-licensing setup: **[docs/NPM.md](docs/NPM.md)**.

### ESM

```js
import '@humza/feature-cards';

const el = document.querySelector('feature-cards');
el.data = {
  cards: [{ id: 'a', title: 'Hello', cta: { label: 'Go', href: '/go' } }],
};
```

### Progressive enhancement (JS disabled)

```html
<feature-cards heading="From plain links">
  <a href="/docs" data-eyebrow="Guides" data-description="Integrate in an afternoon">
    Read the documentation
  </a>
</feature-cards>
```

### Headless CMS

```html
<feature-cards src="https://cms.example.com/api/cards" adapter="wordpress"></feature-cards>
```

### Imperative mount

```js
import { createFeatureCards } from '@humza/feature-cards';

createFeatureCards({
  target: '#cards-host',
  src: 'https://cms.example.com/api/cards',
  adapter: 'wordpress',
  onReady: ({ count }) => console.log(`Rendered ${count} cards`),
});
```

### React (optional peer)

```tsx
import { FeatureCards } from '@humza/feature-cards/react';

<FeatureCards
  data={{ cards: [{ id: 'a', title: 'Hello', cta: { label: 'Go', href: '/go' } }] }}
  onCardClick={({ id }) => console.log(id)}
/>
```

## Data model

All sources normalise to one JSON shape. Full reference: **[docs/SCHEMA.md](docs/SCHEMA.md)**.

### 501 stat module (primary brief)

| Editor label | JSON field |
| --- | --- |
| Top text | `eyebrow` |
| Middle text | `figure.value` |
| Bottom text | `figure.label` |
| Icon / image | `media.src` + `alt` |

Use `layout: "stat"` and optional `appearance` for colours, rotation, scale, and
min-height. Try the **501 feature cards — live editor** at the top of the demo page.

```json
{
  "cards": [
    {
      "id": "guests",
      "layout": "stat",
      "eyebrow": "More than",
      "figure": { "value": "12,000,000", "label": "delighted guests" },
      "media": { "src": "/icons/lucide/users.svg", "alt": "" },
      "theme": "501-green",
      "appearance": { "background": "#c6f135", "rotateDeg": 0, "scale": 1 }
    }
  ]
}
```

### Standard marketing card

```json
{
  "heading": "Optional section title",
  "cards": [
    {
      "id": "unique-id",
      "layout": "standard",
      "title": "Required card title",
      "eyebrow": "Optional kicker",
      "description": "Supporting copy",
      "figure": { "value": "97%", "label": "customer satisfaction", "trend": "up" },
      "media": { "src": "/img.svg", "alt": "" },
      "cta": { "label": "Learn more", "href": "/path" },
      "theme": "brand-blue"
    }
  ]
}
```

**Precedence** (highest wins): `data` property → inline JSON → `src` + adapter → light-DOM links.

## Public API

### Attributes

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `src` | URL | — | JSON endpoint to fetch card data |
| `adapter` | `generic` \| `wordpress` \| `contentful` \| `sanity` | `generic` | CMS payload mapper |
| `columns` | `1`–`6` | auto-fit | Caps grid track count |
| `heading` | string | from data | Section heading (overrides data `heading`) |
| `heading-level` | `1`–`6` | `2` | Section heading level; card titles = level + 1 |
| `theme` | `brand-blue` \| `brand-green` \| `brand-amber` | — | Host theme (per-card `theme` in data wins) |

### Properties

| Property | Type | Description |
| --- | --- | --- |
| `data` | `FeatureCardsData \| undefined` | Validated data; highest precedence. Reads back current render state. |
| `provenance` | object (readonly) | Inert authorship record (UUID, repo, licence) |

### Events (bubble, composed)

| Event | `detail` | When |
| --- | --- | --- |
| `featurecards:ready` | `{ count }` | Render completed |
| `featurecards:error` | `{ issues[], problem }` | Invalid data or fetch failure — **never throws** |
| `featurecards:cardclick` | `{ id, card }` | Card link activated |

### Slots

| Slot | Purpose |
| --- | --- |
| *(default)* | No-JS fallback / invalid-data fallback |
| `heading` | Replace generated section heading |

### Theming — CSS custom properties

| Token | Purpose | Token | Purpose |
| --- | --- | --- | --- |
| `--fc-font` | Font stack | `--fc-card-min` | Min card track width |
| `--fc-bg` | Section background | `--fc-gap` | Grid gap |
| `--fc-fg` | Primary text | `--fc-pad` | Card padding |
| `--fc-muted` | Secondary text | `--fc-radius` | Corner radius |
| `--fc-accent` | Accent colour | `--fc-shadow` / `--fc-shadow-hover` | Elevation |
| `--fc-card-bg` | Card background | `--fc-ring` | Focus ring |
| `--fc-card-border` | Card border | `--fc-transition` | Motion timing |

### CSS parts

`::part(section)` · `::part(heading)` · `::part(grid)` · `::part(card)` ·
`::part(link)` · `::part(eyebrow)` · `::part(title)` · `::part(description)` ·
`::part(figure)` · `::part(value)` · `::part(label)` · `::part(media)` · `::part(cta)`

```css
feature-cards {
  --fc-accent: rebeccapurple;
  --fc-radius: 4px;
}
feature-cards::part(card):hover {
  outline: 2px solid rebeccapurple;
}
```

TypeDoc: `npm run docs:api` → `docs/api/` (CI uploads artefacts).

## CMS integration

One canonical schema; **adapters** map CMS JSON into it.

```html
<!-- WordPress REST (+ _embed for media) -->
<feature-cards src="https://site.com/wp-json/wp/v2/posts?_embed" adapter="wordpress"></feature-cards>

<!-- Contentful Delivery API -->
<feature-cards src="https://cdn.contentful.com/spaces/SPACE/entries?content_type=card&access_token=TOKEN" adapter="contentful"></feature-cards>

<!-- Sanity GROQ HTTP API -->
<feature-cards src="https://PROJECT.api.sanity.io/v2024-01-01/data/query/production?query=..." adapter="sanity"></feature-cards>

<!-- Already canonical JSON -->
<feature-cards src="/api/cards" adapter="generic"></feature-cards>
```

| Guide | Topics |
| --- | --- |
| [WordPress](docs/cookbook/wordpress.md) | `functions.php`, REST, imperative mount, SRI |
| [Contentful](docs/cookbook/contentful.md) | Content model, Delivery API, webhook → static JSON |
| [Sanity](docs/cookbook/sanity.md) | GROQ, HTTP API, Studio preview workflow |

New CMS = one ~40-line adapter + registry line. Mock Worker OpenAPI:
[live schema](https://cms.501fun.humza-butt.space/openapi.json) ·
[source](docs/openapi/cms-api.json).

**Stuck?** → [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) · [docs/FAQ.md](docs/FAQ.md)

## Demo page themes and motion

The live demo includes a **Vibe check** picker — twelve parody-named page themes
(Corporate Daydream™, Pager Duty Noir, …). Themes swap via `--page-*` CSS
properties with animated crossfade; choice persists in `localStorage`
(`fc-page-theme`).

Scroll reveals, hero stagger, schema validation flashes, and component enter/hover
animations live in `demo/motion/`. Both layers honour `prefers-reduced-motion`.

> **Note:** Page themes are **demo-only** — not part of the npm package. Production
> sites use `--fc-*` component tokens. Full guide: **[docs/DEMO.md](docs/DEMO.md)**.

## Accessibility

Semantic structure, configurable heading levels, single-link cards, trend
announcements, keyboard-native interaction, reduced-motion and high-contrast
support, and an **axe-core CI gate at zero violations**.

| Topic | Document |
| --- | --- |
| WCAG mapping, keyboard, SR behaviour | [ACCESSIBILITY.md](ACCESSIBILITY.md) |
| FAQ | [docs/FAQ.md](docs/FAQ.md) |
| Tests | [docs/TESTING.md](docs/TESTING.md) |

## Architecture & methodology

| ADR | Decision |
| --- | --- |
| [0001](docs/adr/0001-web-component-over-framework.md) | Custom Element over framework |
| [0002](docs/adr/0002-shadow-dom-encapsulation.md) | Shadow DOM encapsulation |
| [0003](docs/adr/0003-schema-and-adapters.md) | Zod schema + adapters |
| [0004](docs/adr/0004-agpl-licence.md) | AGPL + canary provenance |
| [0005](docs/adr/0005-container-queries.md) | Container-query layout |
| [0006](docs/adr/0006-page-themes-and-motion.md) | Demo themes & motion |

Narrative: [ARCHITECTURE.md](ARCHITECTURE.md) · Diagrams: [docs/diagrams/architecture.md](docs/diagrams/architecture.md)

## Development

```sh
npm run setup        # first-time: env, deps, Playwright, build:lib, doctor
npm run dev          # demo → http://localhost:5173
npm run serve:cms    # mock CMS → http://localhost:8787/api/cards (second terminal)
npm run check        # typecheck + lint + format + tests + size
```

### Tooling

| Command | Output |
| --- | --- |
| `npm run docs:api` | TypeDoc → `docs/api/` |
| `npm run cem` / `cem:check` | Custom Elements Manifest |
| `npm run sri` | IIFE Subresource Integrity hash |
| `npm run validate:cms -- <url>` | Smoke-test CMS JSON |
| `npm run rules:sync` | Mirror agent rules to `.claude/` + `.agents/` |

| Artefact | Purpose |
| --- | --- |
| [custom-elements.json](custom-elements.json) | CEM — IDE autocomplete |
| [.vscode/html-custom-data.json](.vscode/html-custom-data.json) | VS Code tag hints |
| [docs/api/](docs/api/) | Generated API reference |

Contributors: [CONTRIBUTING.md](CONTRIBUTING.md) · Agents: [AGENTS.md](AGENTS.md)

## Testing

```sh
npm run test:unit       # Vitest
npm run test:contracts  # MSW adapter contracts
npm run test:fuzz       # Property-based schema
npm run test:a11y       # axe zero violations
npm run test:e2e        # Playwright demo flows
npm run test:visual     # Screenshot regression (Chromium)
npm run test:browser    # Web Test Runner
npm run check           # All gates
```

Full matrix: **[docs/TESTING.md](docs/TESTING.md)**

## Releasing

```sh
npm run release:current
npm run release -- --patch              # bump + changelog + tag
npm run release -- --minor --publish    # tag + npm publish
```

Playbook: **[docs/RELEASE.md](docs/RELEASE.md)** · Stable `v*.*.*` tags publish to npm when `NPM_TOKEN` is set.

## Deployment

**Production demo:** [501fun.humza-butt.space](https://501fun.humza-butt.space)

| Service | URL |
| --- | --- |
| Demo (Cloudflare Pages) | `https://501fun.humza-butt.space` |
| Mock CMS (Worker) | `https://cms.501fun.humza-butt.space/api/cards` |

Push to **`master`** triggers CI deploy (see [`config/site.json`](config/site.json)).
PRs receive `*.pages.dev` preview URLs.

### One-time setup

1. **DNS** — `501fun.humza-butt.space` on Cloudflare zone `humza-butt.space`
2. **GitHub secrets** — `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
3. **Token permissions** — Pages Edit, Workers Edit, Zone DNS Edit

Local deploy uses `.env` via `scripts/run-wrangler.mjs` — not `wrangler login` OAuth.

### Manual deploy

```sh
npm run deploy
npm run canary:verify -- https://501fun.humza-butt.space
```

## Documentation index

| Document | Description |
| --- | --- |
| [docs/README.md](docs/README.md) | **Master documentation hub** |
| [docs/SCHEMA.md](docs/SCHEMA.md) | Canonical JSON reference |
| [docs/FAQ.md](docs/FAQ.md) | Frequently asked questions |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Symptom → fix guide |
| [docs/TESTING.md](docs/TESTING.md) | Test matrix and conventions |
| [docs/DEMO.md](docs/DEMO.md) | Demo page themes & motion |
| [docs/RELEASE.md](docs/RELEASE.md) | Release playbook |
| [docs/BRANCHING.md](docs/BRANCHING.md) | Branch strategy |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Design narrative |
| [ACCESSIBILITY.md](ACCESSIBILITY.md) | a11y specification |
| [SECURITY.md](SECURITY.md) | Security & canary verification |
| [CHANGELOG.md](CHANGELOG.md) | Version history |

## Licence

**AGPL-3.0-only** — © 2026 Humza Butt. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

You may read, run, and evaluate freely. Deploying modified versions as a network
service requires offering corresponding source under the same licence. Commercial
closed-source use requires a [commercial licence](COMMERCIAL-LICENSING.md).

| Document | Purpose |
| --- | --- |
| [LEGAL.md](LEGAL.md) | Enforcement guide — evidence, takedowns, contacts |
| [TRADEMARK.md](TRADEMARK.md) | Name and logo usage policy |
| [TERMS_OF_USE.md](TERMS_OF_USE.md) | Live demo site terms |
| [SECURITY.md](SECURITY.md) | Canary watermark verification |

Inert authorship markers are verifiable: `npm run canary:verify -- <url>`.
