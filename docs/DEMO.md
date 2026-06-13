# Demo page guide

The live demo at [501fun.humza-butt.space](https://501fun.humza-butt.space) is a
**showcase**, not part of the npm package API. It exercises every integration path,
the schema playground, parody themes, and motion polish.

Run locally:

```sh
npm run dev          # http://localhost:5173
npm run serve:cms    # mock CMS at http://localhost:8787/api/cards (second terminal)
```

## Page sections

| Section | What it demonstrates |
| --- | --- |
| **501 feature cards — live editor** | **Primary task deliverable** — edit top / middle / bottom / icon, colours, rotate, scale; advanced typography & borders; copy JSON |
| **Hero** | Project positioning, badges, staggered entrance motion |
| **Vibe check** | Page theme picker (12 parody themes) |
| **Inline JSON** | `<script type="application/json">` data source |
| **Light DOM** | Progressive enhancement from plain `<a>` children |
| **CMS fetch** | `src` + `adapter="generic"` against mock Worker |
| **Theming playground** | Host `--fc-*` overrides on live instance |
| **Resizable container** | Container-query reflow (drag width slider) |
| **Schema playground** | Edit JSON, live preview, validation flash |

## Card editor (`demo/editor/`)

The editor at the top of the demo page is the reference UI for the **501 landing-page
brief**. It must stay in sync with the schema field mapping:

| Core panel | Schema |
| --- | --- |
| Top text | `eyebrow` |
| Middle text | `figure.value` |
| Bottom text | `figure.label` |
| Icon | `media.src` |
| Icon size | `appearance.mediaMaxHeight` |
| Background / text colour | `appearance.background` / `appearance.foreground` |
| Rotate / scale / min height | `appearance.rotateDeg` / `scale` / `minHeight` |

Advanced controls (font sizes, borders, radius, font family) live in the
`<details>` panel only. Icons come from [Lucide](https://lucide.dev/) — the picker
shows a visual preview for each icon. Regenerate assets with `npm run icons:sync`.
State persists in `localStorage` (`fc-card-editor-data`).

Do not move core fields into advanced-only UI or remove the editor without updating
`.cursor/rules/49-stat-cards-and-editor.mdc` and `docs/SCHEMA.md`.

## Page themes (Vibe check)

Twelve parody-named themes live in `demo/themes/`:

| ID | Display name | Scheme |
| --- | --- | --- |
| `corporate-daydream` | Corporate Daydream™ | light |
| `pager-duty-noir` | Pager Duty Noir | dark |
| `sepia-substack` | Sepia Substack Writer's Loft | light |
| `vaporwave-investor-deck` | Vaporwave Investor Deck | dark |
| `forest-gump-enterprise` | Forest Gump Enterprise Edition | dark |
| `bubblegum-saas-pitch` | Bubblegum SaaS Pitch Deck | light |
| `terminal-green-envy` | Terminal Green Envy | dark |
| `sunset-linkedin-post` | Sunset LinkedIn Thought Leadership | light |
| `coffee-shop-minimalist` | Coffee Shop Minimalist (No WiFi) | light |
| `discord-mod-at-3am` | Discord Mod at 3am | dark |
| `government-portal-chic` | Government Portal Chic | light |
| `high-contrast-parental-controls` | High-Contrast Parental Controls | dark |

### How themes work

1. **`page-theme-tokens.ts`** — registry, `localStorage` key (`fc-page-theme`), apply helpers
2. **`page-themes.css`** — full `--page-*` token block per `[data-page-theme]`
3. **`page-theme-transitions.css`** — `@property` colour interpolation (~720ms)
4. **`page-theme-controller.ts`** — picker wiring, crossfade orchestration

### FOUC guard

`demo/index.html` includes an inline script that runs **before first paint** so the
correct theme applies immediately. **Keep in sync** with constants in
`page-theme-tokens.ts` (`KEY`, `DEFAULT_LIGHT_THEME`, `DEFAULT_DARK_THEME`).

### Important: demo vs production

| Token family | Scope | Ship in npm? |
| --- | --- | --- |
| `--fc-*` | Component theming API | **Yes** |
| `--page-*` | Demo chrome only | **No** |

Integrators should not copy `--page-*` into production sites.

## Motion layer

`demo/motion/` adds scroll reveals, hero stagger, theme flash overlay, schema
validation pulses, and resize readout ticks. Component-level enter/hover motion
lives in `src/styles.ts`.

All motion honours **`prefers-reduced-motion: reduce`**:

- Component transitions → `0s`
- Page sets `html[data-motion="reduce"]`
- Theme crossfade skipped; hint text swaps instantly

See `.cursor/rules/48-page-motion.mdc` for contributor requirements.

## Schema playground

Located at `#schema-playground` on the demo page:

1. Edit JSON textarea
2. Live preview renders into a sandbox `<feature-cards>`
3. Validation panel flashes green/red on parse result

Use this to prototype CMS payloads before wiring `src`. Sanity cookbook recommends
pasting Vision query output here first.

## Mock CMS Worker

Production: `https://cms.501fun.humza-butt.space/api/cards`

| Route | Purpose |
| --- | --- |
| `GET /api/cards` | Card JSON (`FeatureCardsData`) |
| `GET /openapi.json` | OpenAPI 3 schema |

Local: `npm run serve:cms` with `worker/.dev.vars` for CORS.

Validate any endpoint:

```sh
npm run validate:cms -- http://localhost:8787/api/cards
```

## Meta tag for CMS URL

```html
<meta name="fc-cms-endpoint" content="https://cms.501fun.humza-butt.space/api/cards" />
```

The demo reads this for the `#cms-instance` `src` attribute.

## Contributor rules

| Rule file | Governs |
| --- | --- |
| `.cursor/rules/46-demo-page.mdc` | Demo page structure and UX |
| `.cursor/rules/47-page-themes.mdc` | Theme token completeness |
| `.cursor/rules/48-page-motion.mdc` | Motion requirements |

After editing Cursor rules: `npm run rules:sync`.

## Related

- [ADR-0006](adr/0006-page-themes-and-motion.md)
- [README § Demo themes](../README.md#demo-page-themes-and-motion)
- [TESTING.md](TESTING.md) — e2e coverage for picker and reduced motion
