# 501 Feature Cards - Submission Brief

**Author:** Humza Butt  
**Date:** June 2026

This document is a direct response to the **501 Website Landing Page** technical brief. It summarises what was built, why, and where to review it.

---

## The problem

On the 501 marketing site, the three coloured stat cards below the header are **static images**. When figures, copy, or styling change, a designer must edit and re-export assets manually. That is slow, error-prone, and inaccessible to content editors.

## The solution

A reusable `**<feature-cards>` Web Component** replaces those image cards with **live, editable data**:


| Brief requirement                  | How it is met                                                                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Reusable module for a landing page | One Custom Element embeddable via script tag, ESM, or optional React wrapper                                                               |
| Well-documented                    | [README.md](README.md), [docs/](docs/README.md), schema reference, CMS cookbooks                                                           |
| Well-structured                    | Schema-first data layer, thin CMS adapters, Shadow DOM render layer - see [ARCHITECTURE.md](ARCHITECTURE.md)                               |
| Accessible                         | Semantic headings/links, keyboard-native CTAs, axe checks in CI (zero violations)                                                          |
| Responsive                         | CSS **container queries** and auto-fit grid — layout follows the component width, not the viewport                                         |
| CMS-agnostic                       | Canonical JSON schema + adapters for generic JSON, WordPress, Contentful, and Sanity                                                       |
| Minimal CMS adjustment             | Drop in a script tag and pass JSON inline, via `src`, or from CMS fields                                                                   |
| Vanilla HTML, CSS, JS              | Shipped bundle uses native APIs only: Custom Elements, Shadow DOM, constructable stylesheets — **no framework runtime** (~25 KiB gzip ESM) |


The **501 stat layout** maps directly to the brief’s card fields:


| Card region   | Data field                |
| ------------- | ------------------------- |
| Top text      | `eyebrow`                 |
| Middle figure | `figure.value`            |
| Bottom label  | `figure.label`            |
| Icon / image  | `media.src` + `media.alt` |


Per-card colour, rotation, and scale use `theme` and `appearance`. The live demo includes a **card editor** so stakeholders can preview changes without a designer.

---

## Methodology (why this approach)

**Native Custom Element over a framework component** — WordPress themes, legacy portals, and static CMS pages rarely share one React/Vue stack. A Web Component registers once, upgrades existing HTML, and ships as a single file any CMS can include.

**Shadow DOM**: styles cannot leak in or out on unknown host pages; theming is exposed through documented `--fc-`* CSS custom properties.

**Schema + adapters**: every CMS normalises to one JSON shape (validated with Zod). Adding a new CMS means a small adapter, not a rewrite of the renderer.

**Progressive enhancement**: with JavaScript disabled, plain `<a>` children in the light DOM remain usable links; the component upgrades when JS loads.

**TypeScript authored, vanilla JS shipped**: strict types and tests during development; consumers receive standards-based JS with no build step required.

Full rationale, trade-offs, and ADRs: **[ARCHITECTURE.md](ARCHITECTURE.md)** · **[docs/adr/](docs/adr/)**

---

## Links (required)


|                                  | URL                                                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **GitHub repository**            | [https://github.com/Hum2a/feature-cards](https://github.com/Hum2a/feature-cards)                                   |
| **Working example (live demo)**  | [https://501fun.humza-butt.space](https://501fun.humza-butt.space)                                                 |
| **npm package**                  | [https://www.npmjs.com/package/@techystuff/feature-cards](https://www.npmjs.com/package/@techystuff/feature-cards) |
| **Mock CMS API (headless demo)** | [https://cms.501fun.humza-butt.space/api/cards](https://cms.501fun.humza-butt.space/api/cards)                     |


**Quick evaluation path for reviewers:**

1. Open the **live demo** — scroll to the three 501-style stat cards and use the **live editor** at the top.
2. View page source or DevTools — confirm `<feature-cards>` and JSON data, not raster images.
3. Clone the repo → `npm run setup` → `npm run dev` for local development.
4. Run `npm run test:a11y` to reproduce the accessibility gate.

Install guide for integrators: **[docs/INSTALL.md](docs/INSTALL.md)**

---

## Portfolio links

Sites and projects I have worked on (most relevant first):


| Site / project                          | Role                                 | Link                                                                                                                                              |
| --------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **501 Feature Cards** (this submission) | Design, build, deploy, documentation | [https://501fun.humza-butt.space](https://501fun.humza-butt.space)                                                                                |
| **Source code & CI**                    | Full implementation                  | [https://github.com/Hum2a/feature-cards](https://github.com/Hum2a/feature-cards)                                                                  |
| **Personal / portfolio site**           | *Owner*                              | https://humza-butt.space                                                                                                                          |
| **Additional client or employer sites** | *LifeSmart**BakesByOlayide* *Bgr8* | [networthtool.lifesmartfinance.com](http://networthtool.lifesmartfinance.com)[bakesbyolayide.co.uk](http://bakesbyolayide.co.uk)https://bgr8.uk |


---

## Contact

**Humza Butt** - [Humzab1711@hotmail.com](mailto:Humzab1711@hotmail.com)  
GitHub: [https://github.com/Hum2a](https://github.com/Hum2a)