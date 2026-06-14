# Install & use `@techystuff/feature-cards`

How to add the published npm package to your site or app. For publishing and
org setup, see **[NPM-PUBLISH.md](NPM-PUBLISH.md)** (maintainers only).

| | |
| --- | --- |
| **Package** | [`@techystuff/feature-cards`](https://www.npmjs.com/package/@techystuff/feature-cards) |
| **Current version** | `1.0.8` (pin this in production) |
| **Licence** | [AGPL-3.0-only](../LICENSE) |
| **Live demo** | [501fun.humza-butt.space](https://501fun.humza-butt.space) |
| **Source** | [github.com/Hum2a/feature-cards](https://github.com/Hum2a/feature-cards) |

---

## What you get from npm

The package ships a **Web Component** — a custom element `<feature-cards>` — that
renders accessible stat and marketing cards from JSON. The core bundle is vanilla
JavaScript (~25 KiB gzip). No React or Vue is required unless you choose the
optional React wrapper.

### Included in the tarball

| Asset | Purpose |
| --- | --- |
| `dist/feature-cards.js` | ESM bundle (Vite, webpack, etc.) |
| `dist/feature-cards.iife.js` | Script-tag / CDN bundle |
| `dist/react.js` | Optional React wrapper |
| `dist/types/` | TypeScript declarations |
| `custom-elements.json` | Custom Elements Manifest (editor tooling) |
| Legal files | `LICENSE`, `NOTICE`, `COMMERCIAL-LICENSING.md`, … |

### Not included (demo only — not part of the npm API)

| Excluded | Where it lives |
| --- | --- |
| Card editor UI | [Demo site](https://501fun.humza-butt.space) |
| Page themes & motion | `demo/` in the repo |
| Mock CMS Worker | [cms.501fun.humza-butt.space](https://cms.501fun.humza-butt.space/api/cards) |

---

## Install

### Option A — npm (bundled apps)

```sh
npm install @techystuff/feature-cards
```

Pin an exact version in production:

```sh
npm install @techystuff/feature-cards@1.0.8
```

### Option B — CDN (no build step)

Works in WordPress, static HTML, or any CMS that allows a `<script>` tag:

```html
<script
  src="https://cdn.jsdelivr.net/npm/@techystuff/feature-cards@1.0.8/dist/feature-cards.iife.js"
  defer
></script>
```

[jsDelivr](https://www.jsdelivr.com/package/npm/@techystuff/feature-cards) and
[unpkg](https://unpkg.com/@techystuff/feature-cards@1.0.8/) mirror npm automatically.

For Subresource Integrity hashes, run `npm run sri` in the repo or see the
[WordPress cookbook](cookbook/wordpress.md).

---

## Package exports

| Import / path | Use when |
| --- | --- |
| `@techystuff/feature-cards` | Register the element + imperative APIs |
| `@techystuff/feature-cards/iife` | Reference path for the script-tag bundle |
| `@techystuff/feature-cards/react` | React apps (peer: `react >= 18`) |

---

## Usage patterns

### 1. Inline JSON (simplest — works with CDN)

Load the IIFE script, then put JSON inside the element:

```html
<script
  src="https://cdn.jsdelivr.net/npm/@techystuff/feature-cards@1.0.8/dist/feature-cards.iife.js"
  defer
></script>

<feature-cards heading="Why teams choose us">
  <script type="application/json">
    {
      "cards": [
        {
          "id": "guests",
          "layout": "stat",
          "eyebrow": "More than",
          "figure": { "value": "12,000,000", "label": "delighted guests" },
          "media": { "src": "/icons/users.svg", "alt": "" },
          "theme": "501-green"
        }
      ]
    }
  </script>
</feature-cards>
```

### 2. ESM import (Vite, Next.js, etc.)

```js
import '@techystuff/feature-cards';

const el = document.querySelector('feature-cards');
el.data = {
  cards: [
    {
      id: 'a',
      title: 'Hello',
      cta: { label: 'Go', href: '/go' },
    },
  ],
};
```

### 3. Headless CMS

Point at a JSON endpoint and pick an adapter:

```html
<feature-cards
  src="https://cms.example.com/api/cards"
  adapter="wordpress"
></feature-cards>
```

Supported adapters: `wordpress`, `contentful`, `sanity`, `generic`. See
[SCHEMA.md](SCHEMA.md) and the [cookbooks](cookbook/README.md).

### 4. Imperative mount

```js
import { createFeatureCards } from '@techystuff/feature-cards';

createFeatureCards({
  target: '#cards-host',
  src: 'https://cms.example.com/api/cards',
  adapter: 'wordpress',
  onReady: ({ count }) => console.log(`Rendered ${count} cards`),
});
```

### 5. React (optional)

```tsx
import { FeatureCards } from '@techystuff/feature-cards/react';

<FeatureCards
  data={{
    cards: [{ id: 'a', title: 'Hello', cta: { label: 'Go', href: '/go' } }],
  }}
  onCardClick={({ id }) => console.log(id)}
/>;
```

Install React separately — it is an optional peer dependency.

### 6. Progressive enhancement (no JavaScript)

Plain links inside the element work before the script loads:

```html
<feature-cards heading="From plain links">
  <a href="/docs" data-eyebrow="Guides" data-description="Integrate in an afternoon">
    Read the documentation
  </a>
</feature-cards>
```

---

## Licence

Published under **AGPL-3.0-only**:

| Your situation | What to do |
| --- | --- |
| Open source / can offer source to users | `npm install` — free under [LICENSE](../LICENSE) |
| Evaluating the component | Install and run freely under AGPL |
| Closed-source SaaS or proprietary product | [Commercial licence](../COMMERCIAL-LICENSING.md) from the author |

There is no separate “commercial npm package”. Paying customers install the same
`@techystuff/feature-cards` from the public registry under a signed grant that
overrides AGPL for their scope.

---

## Verify install (quick smoke test)

```sh
mkdir my-fc-test && cd my-fc-test
npm init -y
npm install @techystuff/feature-cards@1.0.8
node -e "console.log(require.resolve('@techystuff/feature-cards'))"
```

You should see a path into `node_modules/@techystuff/feature-cards/dist/…`.

---

## Next steps

| Goal | Read |
| --- | --- |
| Full JSON field reference | [SCHEMA.md](SCHEMA.md) |
| WordPress / CDN + SRI | [cookbook/wordpress.md](cookbook/wordpress.md) |
| Contentful / Sanity | [cookbook/](cookbook/README.md) |
| Theming & CSS parts | [README § Public API](../README.md#public-api) |
| Common questions | [FAQ.md](FAQ.md) |
| Something broken | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |

---

**Maintainers:** publishing, org setup, tarball checks → [NPM-PUBLISH.md](NPM-PUBLISH.md)
