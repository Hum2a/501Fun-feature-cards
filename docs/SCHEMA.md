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

## Card layouts

| `layout` | Purpose |
| --- | --- |
| `stat` | **501 landing-page module** — top / hero / bottom / foot icon |
| `standard` | Title-led marketing card with optional description + CTA |

### 501 stat module — four core elements

| Editor / UI | Schema | Example |
| --- | --- | --- |
| Top text | `eyebrow` | “More than” |
| Middle text | `figure.value` | “12,000,000” |
| Bottom text | `figure.label` | “delighted guests” |
| Icon / image | `media.src` + `alt` | `/icons/lucide/users.svg`, `alt: ""` |

```json
{
  "id": "guests",
  "layout": "stat",
  "eyebrow": "More than",
  "figure": { "value": "12,000,000", "label": "delighted guests" },
  "media": { "src": "/icons/lucide/users.svg", "alt": "" },
  "theme": "501-green",
  "appearance": {
    "background": "#c6f135",
    "foreground": "#0a0a0a",
    "rotateDeg": 0,
    "scale": 1,
    "minHeight": "18rem"
  }
}
```

Per-card **`appearance`** controls background, text colour, rotation, scale,
min-height, typography, and borders. The demo **card editor** (`demo/editor/`)
is the reference UI for these fields.

Themes: `501-green`, `501-magenta`, `501-blue` (reference palette).

## Card (all layouts)

```json
{
  "id": "satisfaction",
  "layout": "standard",
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
| `layout` | `"standard"` \| `"stat"` | No | Default inferred from fields; use `stat` for 501 module. |
| `eyebrow` | `string` | No | Top text in stat layout; kicker in standard layout. |
| `title` | `string` (min 1) | Standard: **Yes** | Rendered as heading (standard). Optional in stat when figure is complete. |
| `description` | `string` | No | Supporting copy (standard layout). |
| `figure` | `Figure` | No | Middle + bottom text in stat layout (`value` + `label`). |
| `media` | `Media` | No | Icon/image — foot of stat cards. |
| `cta` | `Cta` | No | When present, the **entire card** is a single link. |
| `theme` | `string` | No | `brand-*` or `501-*` theme tokens. |
| `appearance` | `CardAppearance` | No | Colours, rotation, scale, typography overrides. |

### CardAppearance

Per-card visual tuning for the 501 module and CMS colour pickers:

| Field | Maps to | Notes |
| --- | --- | --- |
| `background` | `--fc-card-bg` | Card fill colour |
| `foreground` | `--fc-fg` | Text and icon colour |
| `rotateDeg` | `transform: rotate()` | -180…180 |
| `scale` | `transform: scale()` | 0.5…2 |
| `minHeight` | `--fc-stat-min-height` | e.g. `"18rem"` |
| `topFontSize` / `middleFontSize` / `bottomFontSize` | stat typography vars | Advanced editor only |
| `borderWidth` / `borderColor` / `borderRadius` | border tokens | Advanced editor only |
| `mediaMaxHeight` | `--fc-stat-media-max` | Foot icon cap |
| `fontFamily` | `--fc-font` | Optional override |

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
