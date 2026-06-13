# Testing guide

How quality is enforced in `<feature-cards>`. The single gate for contributors is
**`npm run check`**; CI runs the same chain (plus a few parallel jobs).

## Quick reference

| Command | Suite | Environment | CI job |
| --- | --- | --- | --- |
| `npm run test:unit` | Vitest unit tests | happy-dom | `checks` |
| `npm run test:fuzz` | fast-check property tests | happy-dom | `checks` |
| `npm run test:contracts` | MSW adapter contracts | node | `checks` |
| `npm run coverage` | Unit + coverage thresholds | happy-dom | `checks` |
| `npm run test:bench` | Render 100-card benchmark | happy-dom | `benchmark` |
| `npm run test:browser` | Web Test Runner | real Chromium | `browser` |
| `npm run test:a11y` | axe-core via Playwright | Chromium + WebKit | `checks` |
| `npm run test:e2e` | Demo integration | Chromium + WebKit | `checks` |
| `npm run test:visual` | Screenshot layout | Chromium only* | `checks` (layout-only on Linux) |
| `npm run test:ci` | All Playwright + unit chain | mixed | via `check` |

\* WebKit skips visual snapshots — baselines are Chromium-pinned.

## Coverage thresholds

Configured in `vitest.config.ts`:

| Metric | Threshold |
| --- | --- |
| Lines | 90% |
| Branches | 88% |
| Functions | 90% |
| Statements | 90% |

Coverage includes `src/**/*.ts` except `src/react/**` (optional peer).

## Test directories

```
tests/
├── unit/           # Vitest — schema, adapters, element, styles, watermark, demo helpers
├── contracts/      # MSW — CMS payload shapes → canonical schema
├── bench/          # Vitest bench — render throughput
├── browser/        # Web Test Runner — real browser smoke (no Playwright)
├── a11y/           # Playwright + axe — zero violations gate
├── e2e/            # Playwright — demo flows, keyboard, themes, resize
└── visual/         # Playwright — screenshot regression (Chromium)
```

## Writing unit tests

- Place files in `tests/unit/**/*.test.ts` (or `.tsx` for React wrapper).
- Use `@src/...` path alias for imports.
- happy-dom provides DOM; `tests/contracts/**` uses `node` environment.
- Never test private implementation details — assert public DOM, events, and attributes.

**Example — event contract:**

```ts
el.addEventListener('featurecards:ready', (e) => {
  expect(e.detail.count).toBeGreaterThan(0);
});
```

## Accessibility testing

`npm run test:a11y` loads the full demo (all three instantiation modes) and runs
axe with **zero tolerated violations**.

Manual release checklist additions:

- Keyboard Tab through all cards
- 200% zoom reflow
- VoiceOver/NVDA spot check on one card with figure trend

Details: [ACCESSIBILITY.md](../ACCESSIBILITY.md).

## End-to-end scenarios

Key flows in `tests/e2e/demo.spec.ts`:

| Describe block | Asserts |
| --- | --- |
| demo instances | Three modes render 3 cards each |
| keyboard interaction | Tab/Enter, `featurecards:cardclick` |
| container responsiveness | Grid reflows when **container** width changes |
| reduced motion | Transitions `0s`; page `data-motion="reduce"` |
| page theme picker | Theme persists across reload (`localStorage`) |

Playwright starts Vite dev server automatically (`playwright.config.ts`).

## Visual regression

```sh
# Compare against committed snapshots
npm run test:visual

# Intentionally update (Chromium only)
npx playwright test tests/visual --update-snapshots
```

Snapshots live beside specs in `*-snapshots/` folders. Only update when UI change
is deliberate — note it in PR description.

## Contract / fuzz testing

- **Contracts** — MSW mocks WordPress/Contentful/Sanity/generic payloads; adapters
  must produce valid schema output.
- **Fuzz** — fast-check generates random JSON-ish structures; schema must never
  throw.

```sh
npm run test:contracts
npm run test:fuzz
```

## Browser suite (Web Test Runner)

Separate from Playwright — loads the built IIFE in a real browser:

```sh
npm run test:browser   # builds lib first
```

CI runs this in a dedicated `browser` job with Chromium installed.

## Benchmark

```sh
npm run test:bench
```

Guards against render regressions when card count is high (100 cards). Not a
hard latency SLA — watch for order-of-magnitude slowdowns in PRs.

## CI artefacts

Failed or successful CI uploads:

| Artifact | Contents |
| --- | --- |
| `playwright-report` | HTML trace/report |
| `coverage` | lcov + HTML |
| `typedoc-api` | Generated API docs |

Download from the GitHub Actions run summary.

## Definition of done (tests)

From [CONTRIBUTING.md](../CONTRIBUTING.md):

- [ ] `npm run check` green locally
- [ ] New public behaviour → unit tests
- [ ] Markup/a11y changes → `test:a11y` green
- [ ] Visual changes → snapshots updated on Chromium
- [ ] Demo UI changes → rules 47/48 (themes/motion)

## Related

- [FAQ § Development](FAQ.md#development)
- [TROUBLESHOOTING § CI](TROUBLESHOOTING.md#ci--tests-failing-locally)
- `.cursor/rules/30-testing.mdc` — agent testing conventions
