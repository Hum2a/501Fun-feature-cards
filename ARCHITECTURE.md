# Architecture

This document explains *why* the component is built the way it is. The
formal decision records live in [`docs/adr/`](docs/adr/); this is the
narrative version.

## The problem

Replace three hard-coded card images with something *reusable, accessible,
responsive, and CMS-agnostic with minimal adjustment* — using native
browser APIs where possible.

## Why a Custom Element (and not a framework component)

A React/Vue/Svelte component answers "CMS-agnostic" only for sites that run
that framework. A **native Custom Element** runs in any page that can run
JavaScript: WordPress themes, Shopify liquid, server-rendered .NET, static
HTML. There is no runtime to ship, no version matrix, no build-tool
requirement for consumers — a single `<script>` tag or ESM import. That is
the strongest possible reading of the brief. (ADR-0001)

## Why Shadow DOM

Dropping a widget into arbitrary CMS pages means arbitrary global CSS.
Shadow DOM gives hard style encapsulation in both directions: host-page
resets can't break the cards, and card styles can't leak out. Theming stays
possible — deliberately so — through the two official shadow-piercing
mechanisms: CSS custom properties (the `--fc-*` token layer) and
`::part()`. The shadow root is `mode: 'open'` so tests, tooling, and
consumers can introspect. (ADR-0002)

## Why schema + adapters

"CMS-agnostic with minimal adjustment" is a data problem more than a
rendering problem. The design splits it:

- **One canonical schema** (`src/schema.ts`, Zod-validated) is the only
  shape the renderer ever sees. Validation is non-throwing and produces
  structured issues, surfaced via the `featurecards:error` event.
- **Adapters** (`src/adapters/`) are ~40-line pure functions that reshape a
  CMS payload into the schema. WordPress, Contentful, and Sanity ship as
  working examples; a new CMS is one small mapper, registered in one line.

The component itself never learns about any CMS. (ADR-0003)

## Progressive enhancement

The element accepts plain `<a>` children. Before JavaScript loads — or if
it never does — those links render and work. On upgrade, the component
parses them into card data and renders the full UI. Bad data never
destroys content: the shadow root keeps a `<slot>` so the original light
DOM stays visible, and the error is reported as an event instead of a
thrown exception.

Data sources resolve in a documented precedence order (property → inline
JSON → `src` fetch → light DOM), so the same element supports everything
from "hardcode it in the page" to "fetch from a headless CMS."

## Responsiveness without media queries

The component cannot know its viewport context — it may be a full-width
band or a narrow sidebar widget. So it responds to its **container**:
`container-type: inline-size` on the host, `@container` queries for
spacing/typography, CSS Grid `repeat(auto-fit, minmax(...))` for track
count, and `clamp()` for fluid type. A `columns` attribute caps tracks when
a layout demands it. (ADR-0005 territory; covered in ADR-0002/0003
consequences.)

## Authored in TypeScript, shipped as vanilla JS

Strict TypeScript (with `exactOptionalPropertyTypes`,
`noUncheckedIndexedAccess`) catches data-shape errors at compile time and
generates `.d.ts` for consumers — while the shipped artefacts are plain
ESM and a self-registering IIFE with zero framework runtime. Zod is the
single bundled dependency, earning its place as the runtime validation
layer the schema-first design depends on.

## Build pipeline

```
src/*.ts ──vite lib build──► dist/feature-cards.js        (ESM)
         │                  dist/feature-cards.iife.js    (script-tag)
         └─tsc -p build───► dist/types/*.d.ts             (declarations)
demo/    ──vite build─────► dist/demo/                    (Pages deploy)
worker/  ──wrangler───────► mock CMS endpoint             (Worker deploy)
```

Both bundles carry the AGPL licence banner; the size budget is enforced by
`npm run size` (24 KiB gzip for the ESM bundle).

## Trade-offs considered and rejected

| Option | Why rejected |
| --- | --- |
| Framework component (+ wrappers per framework) | Couples consumers to a runtime; fails the "any CMS" requirement. |
| Lit / Stencil | Excellent tools, but a runtime dependency contradicts the "native browser APIs" brief and isn't needed at this scale. |
| Light-DOM rendering (no shadow) | Simpler theming, but style collisions in arbitrary CMS pages are exactly the failure mode this must avoid. |
| iframe embedding | Total isolation, but kills SEO, a11y context, responsive integration, and theming. |
| Hand-rolled validation | Cheaper bytes, but loses typed inference and structured error paths; Zod's cost (~12 KiB gzip) buys the whole schema story. |
| Media queries | Wrong axis — the component must adapt to its container, not the page viewport. |

## Licensing & provenance

AGPL-3.0-only with embedded inert authorship markers (see `SECURITY.md`).
The licence obligates network users of modified versions to share source;
the canary makes provenance provable. (ADR-0004)
