# Frequently asked questions

Quick answers before you open an issue. For integration failures, see
[TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## General

### What is `<feature-cards>`?

A native **Custom Element** that renders an accessible grid of feature/stat
cards from JSON — inline, fetched from a CMS, set imperatively, or parsed
from plain `<a>` children. One component, any page that can load JavaScript.

### Why not React/Vue/Svelte?

Because "CMS-agnostic" includes WordPress PHP themes, static HTML, and legacy
portals that will never adopt a SPA framework. A Web Component loads with one
`<script>` tag. Optional React wrapper ships separately
(`@techystuff/feature-cards/react`). See [ADR-0001](adr/0001-web-component-over-framework.md).

### What's the bundle size?

Roughly **~25 KiB gzip** for the ESM build — enforced by `npm run size`. Zod is
the only bundled runtime dependency.

### Which browsers are supported?

Modern evergreen browsers with Custom Elements, Shadow DOM, container queries,
and `light-dark()`. The no-JS fallback (plain links) works everywhere links work.

## Integration

### Can I use it without a build step?

Yes. Load the IIFE bundle:

```html
<script src="https://cdn.jsdelivr.net/npm/@techystuff/feature-cards@1.1.1/dist/feature-cards.iife.js" defer></script>
```

Pin a version and add SRI from `npm run sri`. See [WordPress cookbook](cookbook/wordpress.md).

### Does it work with SSR?

The element **hydrates on the client**. Server-render plain `<a>` children inside
`<feature-cards>` for meaningful HTML before JS loads (progressive enhancement).
Do not SSR shadow DOM internals.

### How do I add a new CMS?

Write a pure adapter function (~40 lines) mapping the CMS JSON to
`FeatureCardsData`, register it in `src/adapters/index.ts`, add contract tests.
See [ADR-0003](adr/0003-schema-and-adapters.md).

### Why isn't my `src` fetch working?

Common causes:

- CORS blocked — CMS must allow your origin (or use same-origin proxy).
- Wrong `adapter` — payload shape doesn't match the selected mapper.
- Higher-precedence source wins — inline JSON or `el.data` overrides `src`.

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md#src-fetch-issues).

## Theming & styling

### How do I change colours?

Set **`--fc-*` CSS custom properties** on the host element or ancestors that
inherit into the shadow tree. Do not pierce internal classes — use tokens and
`::part()`. Full list in [README § Theming](../README.md#public-api).

### Can I style inside Shadow DOM?

Only via documented **`::part(...)`** hooks and **`--fc-*` tokens**. This is
intentional — see [ADR-0002](adr/0002-shadow-dom-encapsulation.md).

### What are the demo "Vibe check" themes?

**Demo-only** parody page themes (`demo/themes/`). They are **not** part of the
npm package API. Production sites use `--fc-*` component tokens, not
`--page-*` demo tokens. See [DEMO.md](DEMO.md).

## Accessibility

### Is it accessible?

Yes — by design and by CI gate. axe-core must report **zero violations** on the
full demo. Details: [ACCESSIBILITY.md](../ACCESSIBILITY.md).

### Does it support keyboard navigation?

Every card is a native link: **Tab** to focus, **Enter** to activate. No custom
arrow-key grid widget semantics (cards are a list of links, not a composite control).

### What about `prefers-reduced-motion`?

All component transitions disable under `prefers-reduced-motion: reduce`. Demo
page motion follows the same rule.

## Licensing & provenance

### What licence is this?

**AGPL-3.0-only.** Install and licence overview: **[INSTALL.md](INSTALL.md)**.

You may read and evaluate freely. Network deployment of
modified versions requires offering corresponding source to users. Commercial
closed-source use needs a separate licence from the author.

### What is the canary watermark?

Inert authorship markers embedded in shipped bundles and rendered HTML — no
tracking, no behaviour change. Verify with:

```sh
npm run canary:verify -- https://your-site.example
```

See [SECURITY.md](../SECURITY.md).

## Development

### What command runs everything?

```sh
npm run check
```

Typecheck, lint, full test chain, size budget — same gate as CI.

### Where is the API reference?

```sh
npm run docs:api   # → docs/api/
```

CI uploads TypeDoc as an artifact; not hosted as a public URL yet.

### How do I cut a release?

See [RELEASE.md](RELEASE.md) and [CONTRIBUTING § Releasing](../CONTRIBUTING.md).

## Still stuck?

1. [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. [docs/README.md](README.md) — full doc map
3. [GitHub Issues](https://github.com/Hum2a/feature-cards/issues) — not for security reports
