# AGENTS.md — operating manual

Onboarding doc for **AI agents and human contributors**. Read this before changing
anything. Human-readable doc index: [docs/README.md](docs/README.md).

## What this project is

`<feature-cards>` is a **CMS-agnostic, accessible, responsive Web Component**
that replaces hard-coded feature-card images with a reusable custom element.

| Property | Value |
| --- | --- |
| Language | Strict TypeScript |
| Shipped runtime | Zero-framework vanilla JS (ESM + IIFE) |
| Bundled deps | Zod only |
| Validation | `src/schema.ts` + adapters in `src/adapters/` |
| Optional | React wrapper `@techystuff/feature-cards/react` |
| Demo | Vite landing page — themes/motion **not** in npm API |
| Licence | AGPL-3.0-only + inert canary watermark |

## Golden rules

1. **No frameworks in shipped code.** Native browser APIs only.
2. **Progressive enhancement is non-negotiable.** Degrade to plain working links without JS.
3. **Accessibility is an acceptance criterion.** axe zero violations; keyboard complete; reduced motion respected.
4. **Never throw at consumers.** Bad data → `featurecards:error` + preserved light DOM.
5. **Never remove or alter `src/watermark.ts`.** Load-bearing authorship evidence.
6. **AGPL licence header** on every source file.
7. **No new runtime dependencies** without explicit justification.

## Decision tree: where does my change go?

```
Is it card rendering / schema / adapters?
  └─ yes → src/
Is it demo page chrome (themes, motion, playground)?
  └─ yes → demo/ (NOT published npm API)
Is it mock CMS / OpenAPI?
  └─ yes → worker/ + docs/openapi/
Is it tests?
  └─ yes → tests/{unit,contracts,e2e,a11y,visual,browser,bench}/
Is it CI/deploy?
  └─ yes → .github/workflows/ + scripts/
Is it agent/human guidance?
  └─ yes → .cursor/rules/ → npm run rules:sync
Is it user-facing explanation?
  └─ yes → README, ARCHITECTURE, docs/
```

## How to run things

### Daily development

| Command | What it does |
| --- | --- |
| `npm run setup` | New contributor bootstrap (env, ci, rules, browsers, build:lib, doctor) |
| `npm run setup:quick` | Deps + env only — skip browsers and library build |
| `npm run dev` | Vite dev server — demo at `:5173` |
| `npm run serve:cms` | Mock Worker CMS at `:8787` |
| `npm run build` | Library + demo production build |
| `npm run build:lib` | ESM + IIFE + types + CEM only |

### Quality gates

| Command | What it does |
| --- | --- |
| `npm run check` | **Everything gate** — run before every PR |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run format` / `format:check` | Prettier |
| `npm run size` | Bundle budget enforcement |

### Tests (see [docs/TESTING.md](docs/TESTING.md))

| Command | Suite |
| --- | --- |
| `npm run test:unit` | Vitest unit |
| `npm run test:fuzz` | fast-check schema |
| `npm run test:contracts` | MSW adapters |
| `npm run test:bench` | Render benchmark |
| `npm run test:browser` | Web Test Runner |
| `npm run test:a11y` | axe + Playwright |
| `npm run test:e2e` | Demo integration |
| `npm run test:visual` | Screenshot regression |
| `npm run test:ci` | Full chain (no typecheck/lint) |
| `npm run coverage` | Unit + thresholds |

### Docs & artefacts

| Command | Output |
| --- | --- |
| `npm run docs:api` | `docs/api/` TypeDoc |
| `npm run cem` / `cem:check` | `custom-elements.json` drift guard |
| `npm run sri` | IIFE Subresource Integrity hash |
| `npm run validate:cms -- <url>` | Smoke-test CMS JSON |
| `npm run loc:report` | `docs/loc-report.md` |

### Release & deploy

| Command | What it does |
| --- | --- |
| `npm run release -- --patch` | Version + changelog + tag |
| `npm run release:package` | npm publish tagged HEAD |
| `npm run deploy` | Build + Pages + Worker + domains |
| `npm run canary:verify -- <url>` | Scan for authorship markers |

### Agent rules sync

| Command | What it does |
| --- | --- |
| `npm run rules:sync` | `.cursor/rules/` → `.claude/` + `.agents/` |
| `npm run rules:sync:check` | Fail if mirrors stale (CI) |

**Never edit mirrored `.md` files in `.claude/rules/` or `.agents/rules/` directly.**

## Environment files

| File | Purpose |
| --- | --- |
| `.env` | Local dev (gitignored) — copy from `.env.example` |
| `.env.example` | Cloudflare tokens for deploy scripts |
| `worker/.dev.vars` | Wrangler local CMS CORS (gitignored) |
| `worker/.dev.vars.example` | Template for `serve:cms` |

## Definition of done

- [ ] `npm run check` passes locally
- [ ] New public behaviour has unit tests
- [ ] Markup changes: axe green + intentional visual updates
- [ ] Public API reflected in README + JSDoc + `docs/SCHEMA.md` if schema-related
- [ ] Demo UI: rules 47 (themes) and 48 (motion)
- [ ] Licence header on new files
- [ ] No new runtime dependencies
- [ ] If `.cursor/rules/` edited → `npm run rules:sync`

## Repository map

```
feature-cards/
├── src/                    # SHIPPED — element, schema, adapters, styles, react/
├── demo/                   # NOT SHIPPED — landing page showcase
│   ├── themes/             # Page theme tokens + picker
│   └── motion/             # Scroll reveal, transitions
├── worker/                 # Mock CMS Cloudflare Worker
├── tests/                  # unit, contracts, bench, browser, a11y, e2e, visual
├── scripts/                # build, deploy, canary, release, doctor, …
├── docs/
│   ├── README.md           # Documentation index
│   ├── SCHEMA.md           # Canonical JSON reference
│   ├── FAQ.md, TROUBLESHOOTING.md, TESTING.md, DEMO.md, RELEASE.md
│   ├── adr/                # Architecture Decision Records 0001–0006
│   ├── cookbook/           # WordPress, Contentful, Sanity
│   └── openapi/            # CMS Worker schema
├── .cursor/rules/          # Agent rules (SOURCE OF TRUTH)
├── custom-elements.json    # CEM — regenerate with npm run cem
└── config/site.json        # Production URLs + branch
```

## Data flow (mental model)

```
property → inline JSON → src+adapter → light DOM
                    ↓
              Zod safeParse
                    ↓
         valid → render shadow tree
         invalid → featurecards:error + slot fallback
```

Precedence is **top wins**. Never assume `src` is used if `data` is also set.

## Common agent mistakes to avoid

| Mistake | Correct approach |
| --- | --- |
| Changing stat card field mapping without editor/docs | Keep four core fields; update `demo/editor/`, SCHEMA, rule 49 |
| Adding `--page-*` tokens to component | Page tokens are demo-only; use `--fc-*` |
| Using `innerHTML` for card text | `textContent` only |
| Viewport media queries in component | Container queries on `:host` |
| Editing `.claude/rules/` directly | Edit `.cursor/rules/`, run `rules:sync` |
| Throwing on bad CMS data | Emit error event |
| Removing watermark "for cleanliness" | Forbidden — see SECURITY.md |
| Skipping tests for "docs only" PRs that change examples | Runnable snippets must stay accurate |

## Key documentation links

| Doc | Use when |
| --- | --- |
| [docs/SCHEMA.md](docs/SCHEMA.md) | Field shapes, validation, 501 stat mapping |
| [docs/DEMO.md](docs/DEMO.md) | Card editor behaviour |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Integration debugging |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Design rationale |
| [ACCESSIBILITY.md](ACCESSIBILITY.md) | a11y requirements |
| [CONTRIBUTING.md](CONTRIBUTING.md) | PR workflow |
| [docs/RELEASE.md](docs/RELEASE.md) | Shipping versions |
| [docs/NPM.md](docs/NPM.md) | npm doc index (INSTALL + NPM-PUBLISH) |
| [docs/INSTALL.md](docs/INSTALL.md) | Consumer install: npm, CDN, patterns, licence |
| Rule `50-npm-package` | Agent invariants for `@techystuff/feature-cards` |

## Live URLs

| Service | URL |
| --- | --- |
| Demo | https://501fun.humza-butt.space |
| Mock CMS | https://cms.501fun.humza-butt.space/api/cards |
| npm | `@techystuff/feature-cards` |

---

When in doubt: **`npm run check`**, read the nearest ADR, and preserve progressive enhancement.
