# ADR-0003: Canonical schema + CMS adapter layer

- Status: accepted
- Date: 2026-06-12

## Context

"CMS-agnostic" cannot mean the renderer understands every CMS's payload.
WordPress REST, Contentful Delivery, and Sanity GROQ responses share no
shape. Coupling rendering to any of them — or to a lowest common
denominator — would make every new CMS a rendering change.

## Decision

Define **one canonical schema** (`Card`, `FeatureCardsData`) validated with
Zod, and translate CMS payloads into it with small pure **adapter**
functions selected by the `adapter` attribute through a registry
(`getAdapter`), defaulting to a normalising `generic` adapter.

## Consequences

- Integrating a new CMS is one ~40-line mapper plus one registry line; the
  component, styles, and tests don't change. This is the concrete form of
  "minimal adjustment".
- Validation is non-throwing (`safeParse` → structured issues) so bad CMS
  data degrades to an event (`featurecards:error`) and the no-JS fallback,
  never a broken page.
- Zod becomes the single bundled runtime dependency (~12 KiB gzip). Judged
  worth it: typed inference keeps schema and types from drifting, and
  structured error paths power the fail-safe story. Revisit if the size
  budget tightens.
- Adapters are deliberately lossy: they map what the schema models and drop
  the rest, keeping the canonical shape small and renderable.
