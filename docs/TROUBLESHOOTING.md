# Troubleshooting

Symptom-first guide for integrators and contributors. Each section lists the
most likely cause first.

## Nothing renders / blank area

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Empty shadow, no error | Forgot to register the element | Load ESM (`import '@humza/feature-cards'`) or IIFE bundle before use |
| Empty shadow, no error | Invalid JSON in inline `<script>` | Validate against [SCHEMA.md](SCHEMA.md); listen for `featurecards:error` |
| Empty shadow | `cards` array empty or missing | Schema requires `cards.length >= 1` |
| Old content visible | Higher-precedence source | Check `el.data`, inline JSON, then `src` — see precedence in [SCHEMA.md](SCHEMA.md) |
| Flash then blank | Valid data replaced by invalid fetch | Fix CMS payload or remove conflicting `src` |

**Debug snippet:**

```js
document.querySelector('feature-cards')?.addEventListener('featurecards:error', (e) => {
  console.error('feature-cards error', e.detail);
});
```

## `src` fetch issues

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Network error in console | CORS | Add `Access-Control-Allow-Origin` on CMS or proxy through same origin |
| `featurecards:error` with adapter issues | Wrong `adapter` | Match adapter to payload shape (`wordpress`, `contentful`, `sanity`, `generic`) |
| 404 | Bad URL | Test endpoint in browser/`curl`; check trailing slashes |
| Stale content | CDN cache | Bust cache or version the endpoint |
| Works locally, fails in prod | Mixed content | Ensure HTTPS `src` on HTTPS pages |

**Validate CMS JSON:**

```sh
npm run validate:cms -- https://cms.example.com/api/cards
```

## Theming doesn't apply

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Colours unchanged | Targeting internal shadow classes | Use `--fc-*` tokens on `feature-cards` host |
| Partial styling | Specificity war with host CSS | Tokens inherit; avoid `!important` on host resets fighting inherited props |
| Per-card theme ignored | Host `theme` attribute set | Per-card `theme` in data wins — remove host attribute to test |
| Demo theme tokens don't work in prod | `--page-*` is demo-only | Use `--fc-*` in production — see [DEMO.md](DEMO.md) |

## Accessibility / axe failures

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Colour contrast | Custom tokens below AA | Adjust `--fc-fg`, `--fc-muted`, `--fc-card-bg` |
| Missing name | CTA label too vague | Set `cta.ariaLabel` in data |
| Duplicate landmarks | Multiple unlabelled sections | Provide distinct `heading` values |
| Focus not visible | Host CSS removing outlines | Don't override `::part(link):focus-visible` |

Run locally:

```sh
npm run test:a11y
```

## Layout / responsiveness

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Cards stay wide in narrow sidebar | Parent not constraining width | Give host a bounded width; component uses **container queries** |
| Too many columns | Wide container | Set `columns="2"` (or 1–6) to cap tracks |
| Horizontal scroll | Host overflow | Check parent `overflow`; grid uses `minmax` + `auto-fit` |

E2E resize test: `tests/e2e/demo.spec.ts` § container responsiveness.

## Demo dev server

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| CMS instance empty / error | Mock Worker not running | `npm run serve:cms` in second terminal |
| CORS on local CMS | Missing dev vars | Copy `worker/.dev.vars.example` → `worker/.dev.vars` |
| Theme picker resets | Private browsing / blocked storage | `localStorage` key `fc-page-theme` needs storage permission |
| FOUC wrong colours | FOUC guard out of sync | Keep `index.html` inline script in sync with `page-theme-tokens.ts` |

## CI / tests failing locally

| Command | When it fails | What to do |
| --- | --- | --- |
| `npm run cem:check` | CEM drift | `npm run build:lib` and commit `custom-elements.json` |
| `npm run format:check` | Prettier | `npm run format` |
| `npm run test:visual` | Snapshot diff | Update intentionally: `npx playwright test tests/visual --update-snapshots` (Chromium) |
| `npm run test:browser` | Playwright browsers missing | `npx playwright install chromium` |
| `npm run size` | Bundle over budget | Inspect with `npm run analyze`; no accidental deps |

Full matrix: [TESTING.md](TESTING.md).

## Release / deploy

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Pages deploy OK, domain pending | DNS CNAME missing | Cloudflare token needs Zone DNS Edit — see README § Deployment |
| Canary NO MATCH | Old bundle cached | Hard refresh; verify script URL/version |
| npm publish skipped | Missing `NPM_TOKEN` | Set GitHub secret or run `npm run release:package` locally |

See [RELEASE.md](RELEASE.md).

## Getting help

1. Search [FAQ.md](FAQ.md)
2. Read relevant [cookbook](cookbook/) for your CMS
3. Open a [GitHub issue](https://github.com/Hum2a/feature-cards/issues) with reproduction steps
4. Security issues → email in [SECURITY.md](../SECURITY.md), not public issues
