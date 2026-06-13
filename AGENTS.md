# AGENTS.md — operating manual

This file is the onboarding doc for any AI agent or human contributor
working in this repository. Read it before changing anything.

## What this project is

`<feature-cards>` is a **CMS-agnostic, accessible, responsive Web Component**
that replaces hard-coded feature-card images with a reusable custom element.
It is authored in strict TypeScript and shipped as zero-dependency vanilla
JavaScript (ESM + IIFE). Data flows through one canonical Zod-validated
schema (`src/schema.ts`); CMS payloads are mapped onto it by small adapters
(`src/adapters/`).

## Golden rules

1. **No frameworks in shipped code.** Native browser APIs only.
2. **Progressive enhancement is non-negotiable.** The component must degrade
   to plain, working links without JavaScript.
3. **Accessibility is an acceptance criterion.** axe must report zero
   violations; keyboard operation must be complete; reduced motion must be
   respected.
4. **Never throw at consumers.** Bad data renders nothing destructive and
   emits a `featurecards:error` event with structured issues.
5. **The canary watermark in `src/watermark.ts` must never be removed or
   altered.** It is non-functional authorship evidence and part of the
   project's licensing posture. Treat it as load-bearing.
6. Every source file carries the AGPL-3.0 licence header.

## How to run things

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server for the demo page |
| `npm run build` | Library build (ESM + IIFE + types) and demo build |
| `npm run serve:cms` | Run the mock Cloudflare Worker CMS locally |
| `npm run typecheck` / `lint` / `format` | Static checks |
| `npm run test:unit` | Vitest unit tests |
| `npm run test:fuzz` | fast-check property tests for the schema |
| `npm run test:contracts` | MSW contract tests for CMS adapters |
| `npm run test:bench` | Render benchmark (100 cards) |
| `npm run test:browser` | Web Test Runner (real browser, no Playwright) |
| `npm run test:a11y` / `test:e2e` / `test:visual` | Playwright suites (visual baselines are Chromium-only) |
| `npm run test:ci` | Full test chain as CI runs it |
| `npm run check` | The everything gate: typecheck + lint + tests + size |
| `npm run size` | Bundle size vs budget |
| `npm run canary:verify -- <url>` | Scan a URL for the authorship markers |
| `npm run stats` | Repo stats summary (files, LOC snapshot, bundle size) |
| `npm run loc` | Full lines-of-code report (terminal) |
| `npm run loc:report` | Write `docs/loc-report.md` |
| `npm run release -- --patch` | Bump version, update CHANGELOG, create git tag |
| `npm run release:package` | Build, test, and publish to npm (tagged HEAD) |
| `npm run rules:sync` | Mirror `.cursor/rules/` → `.claude/rules/` and `.agents/rules/` |
| `npm run rules:sync:check` | Fail if agent rule mirrors are stale (CI) |
| `npm run docs:api` | Generate TypeDoc reference under `docs/api/` |
| `npm run cem` | Regenerate `custom-elements.json` (runs in `build:lib`) |
| `npm run cem:check` | Fail if CEM manifest drifted from the generator |
| `npm run sri` | Print SRI hash for the IIFE bundle |
| `npm run validate:cms` | Smoke-validate a CMS JSON endpoint |

## Agent rules

Cursor rules live in `.cursor/rules/` (source of truth). After editing them,
run `npm run rules:sync` to replicate the same guidance into:

- `.claude/rules/` — Claude Code / Claude agent sessions
- `.agents/rules/` — other agent tooling that reads a parallel rules dir

Do not edit the mirrored `.md` files directly — they are regenerated.

## Environment files

| File | Purpose |
| --- | --- |
| `.env` | Local dev (gitignored). Copy from `.env.example`. `VITE_*` vars reach the demo. |
| `.env.example` | Committed template for root env vars |
| `worker/.dev.vars` | Wrangler local overrides (gitignored). Copy from `worker/.dev.vars.example`. |
| `worker/.dev.vars.example` | Committed template — sets `CORS_ORIGIN` for `npm run serve:cms` |

## Definition of done for a change

- `npm run check` passes locally.
- New public behaviour has unit tests; rendered-markup changes keep axe at
  zero violations and update visual baselines intentionally.
- Public API changes are reflected in README's API table and JSDoc.
- Demo page UI changes follow rules 47 (page themes) and 48 (page motion).
- The licence header is present on any new source file.
- No new runtime dependencies.

## Repository map

- `src/` — the element (`feature-cards.ts`), styles, schema, adapters,
  watermark, imperative API (`create-feature-cards.ts`), errors
  (`errors.ts`), optional React wrapper (`react/`).
- `demo/` — the example landing page served by Vite (schema playground,
  `themes/` page-theme tokens + picker, `motion/` scroll/transition layer).
- `worker/` — mock Cloudflare Worker CMS endpoint (`/api/cards`, `/openapi.json`).
- `tests/` — `unit/`, `contracts/`, `bench/`, `browser/`, `a11y/`, `e2e/`, `visual/`.
- `scripts/` — Node utility scripts (size, doctor, canary, banner, stats…).
- `docs/adr/` — Architecture Decision Records (0001–0006).
- `docs/cookbook/` — CMS integration walkthroughs.
- `docs/openapi/` — OpenAPI schema for the mock CMS Worker.
- `docs/BRANCHING.md` — branch and release workflow.
- `docs/DEPENDENCY-UPGRADES.md` — deferred major dependency upgrades.
- `custom-elements.json` — Custom Elements Manifest (CEM).
- `.cursor/rules/47-page-themes.mdc`, `48-page-motion.mdc` — demo UI conventions.
