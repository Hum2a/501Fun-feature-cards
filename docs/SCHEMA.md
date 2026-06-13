# Canonical schema reference

`<feature-cards>` renders exactly one data shape. Every CMS adapter, inline JSON
blob, and `data` property assignment must normalise into this schema before
paint. Validation uses [Zod](https://zod.dev/) (`src/schema.ts`); failures are
**non-throwing** and surface as `featurecards:error` events.

## Top-level: `FeatureCardsData`

```json
{
  "heading": "Why teams choose us",
  "cards": [ /* Card[] — at least one */ ]
}
```

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `heading` | `string` | No | Section `<h*>` above the grid. Overridden by the `heading` attribute. |
| `cards` | `Card[]` | **Yes** | Minimum length **1**. Order is display order. |

## Card

```json
{
  "id": "satisfaction",
  "eyebrow": "Customer love",
  "title": "Satisfaction that sticks",
  "description": "Teams report measurable lift within one quarter.",
  "figure": { "value": "97%", "label": "customer satisfaction", "trend": "up" },
  "media": { "src": "/images/chart.svg", "alt": "" },
  "cta": { "label": "Read customer stories", "href": "/customers" },
  "theme": "brand-blue"
}
```

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `string` (min 1) | **Yes** | Stable key for rendering and `featurecards:cardclick` detail. |
| `eyebrow` | `string` | No | Small kicker above the title. |
| `title` | `string` (min 1) | **Yes** | Rendered as a heading one level below the section heading. |
| `description` | `string` | No | Supporting copy under the title. |
| `figure` | `Figure` | No | Headline statistic block. |
| `media` | `Media` | No | Image **or** icon — see below. |
| `cta` | `Cta` | No | When present, the **entire card** is a single link. |
| `theme` | `string` | No | Per-card theme token (`brand-blue`, `brand-green`, `brand-amber`). Wins over host `theme` attribute. |

### Figure

```json
{ "value": "1.2M", "label": "active users", "trend": "up" }
```

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `value` | `string` | **Yes** | Display value — keep human-readable ("97%", not `0.97`). |
| `label` | `string` | **Yes** | Gives the value meaning for sighted and screen-reader users. |
| `trend` | `"up"` \| `"down"` \| `"flat"` | No | Announced in visually-hidden copy, e.g. "(increased)". |

### Media (discriminated union)

**Image:**

```json
{ "src": "https://cdn.example.com/icon.svg", "alt": "Quarterly growth chart" }
```

| `alt` | Meaning |
| --- | --- |
| Non-empty string | Meaningful image — assistive tech reads `alt`. |
| `""` (empty) | Decorative — `aria-hidden` on the `<img>`. |

**Icon (decorative glyph):**

```json
{ "icon": "rocket" }
```

Icons are always treated as decorative. Do not rely on an icon alone to convey
information — put meaning in `title`, `description`, or `figure`.

### CTA (call to action)

```json
{
  "label": "Get started",
  "href": "/signup",
  "ariaLabel": "Get started with feature cards"
}
```

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `label` | `string` | **Yes** | Visible link text inside the card. |
| `href` | `string` | **Yes** | Navigation target. Use site-relative or absolute URLs. |
| `ariaLabel` | `string` | No | Overrides computed accessible name when label lacks context. |

## Data source precedence

When multiple sources are present, the component resolves in this order (highest wins):

```
1. el.data property          (imperative / framework)
2. inline <script type="application/json"> child
3. src fetch + adapter       (remote CMS)
4. default slot light-DOM    (progressive enhancement)
```

Document this order when debugging "why did my CMS data not show?" — see
[TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## Validation errors

Invalid payloads emit `featurecards:error` with:

```ts
{
  issues: { path: string; message: string }[];
  problem: ProblemDetail; // RFC 7807-style extension
}
```

The shadow root keeps the default `<slot>` visible so light-DOM fallback links
still work. The component **never throws** to callers.

## Example payloads

### Minimal (title only)

```json
{ "cards": [{ "id": "hello", "title": "Hello world" }] }
```

### Full-featured trio (demo-style)

```json
{
  "heading": "Proof points",
  "cards": [
    {
      "id": "satisfaction",
      "eyebrow": "Retention",
      "title": "Satisfaction that sticks",
      "description": "Measured across enterprise cohorts.",
      "figure": { "value": "97%", "label": "customer satisfaction", "trend": "up" },
      "cta": { "label": "Read stories", "href": "/customers" },
      "theme": "brand-blue"
    },
    {
      "id": "speed",
      "title": "Ship in an afternoon",
      "figure": { "value": "4h", "label": "median integration time", "trend": "down" },
      "media": { "icon": "bolt" },
      "cta": { "label": "View docs", "href": "/docs" },
      "theme": "brand-green"
    },
    {
      "id": "scale",
      "title": "Built for embeds",
      "description": "Container queries, not viewport hacks.",
      "cta": { "label": "See architecture", "href": "/architecture" },
      "theme": "brand-amber"
    }
  ]
}
```

### Progressive-enhancement source (light DOM)

No JSON required — plain anchors with `data-*` hints:

```html
<feature-cards heading="From plain links">
  <a href="/docs" data-eyebrow="Guides" data-description="Integrate in an afternoon">
    Read the documentation
  </a>
</feature-cards>
```

## TypeScript consumers

```ts
import type { Card, FeatureCardsData } from '@humza/feature-cards';
import { safeParseFeatureCardsData } from '@humza/feature-cards';

const result = safeParseFeatureCardsData(raw);
if (!result.success) {
  console.warn(result.issues);
}
```

Generated declarations ship in `dist/types/`. Run `npm run docs:api` for the
full TypeDoc reference.

## Schema evolution policy

- **Patch:** clarifications, docs, optional fields with defaults.
- **Minor:** new optional card fields, new adapters, new themes.
- **Major:** removing/renaming fields, changing validation strictness.

Fuzz tests (`npm run test:fuzz`) guard against accidental schema drift.

## Related

- [ARCHITECTURE.md](../ARCHITECTURE.md) — why one schema
- [ADR-0003](adr/0003-schema-and-adapters.md) — adapter decision record
- [Cookbooks](cookbook/) — CMS-specific mapping examples
