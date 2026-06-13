# Documentation index

Everything you need to understand, integrate, extend, and ship
`<feature-cards>`. Start at the [README](../README.md) for the elevator pitch;
use this page as the map.

## By role

| You are… | Start here | Then read |
| --- | --- | --- |
| **Integrator** (drop into a CMS page) | [README § Quick start](../README.md#quick-start) | [Cookbooks](#cms-cookbooks), [Schema reference](SCHEMA.md), [FAQ](FAQ.md) |
| **Designer / themer** | [README § Theming](../README.md#public-api) | [Demo themes guide](DEMO.md#page-themes-vibe-check), [ACCESSIBILITY](../ACCESSIBILITY.md) |
| **Contributor** | [CONTRIBUTING](../CONTRIBUTING.md) | [AGENTS](../AGENTS.md), [Testing guide](TESTING.md), [Branching](BRANCHING.md) |
| **Maintainer / releaser** | [Release playbook](RELEASE.md) | [DEPENDENCY-UPGRADES](DEPENDENCY-UPGRADES.md), [SECURITY](../SECURITY.md) |
| **Architect / reviewer** | [ARCHITECTURE](../ARCHITECTURE.md) | [ADRs](adr/), [Diagrams](diagrams/architecture.md) |
| **AI agent** | [AGENTS](../AGENTS.md) | `.cursor/rules/` (source of truth for conventions) |

## Core reference

| Document | What it covers |
| --- | --- |
| [SCHEMA.md](SCHEMA.md) | Canonical `Card` / `FeatureCardsData` JSON — every field, validation rule, example payloads |
| [FAQ.md](FAQ.md) | Common questions: frameworks, SSR, SEO, bundle size, licensing |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Symptom → cause → fix for integration and dev issues |
| [TESTING.md](TESTING.md) | Full test matrix: unit, fuzz, contracts, a11y, e2e, visual, browser bench |
| [DEMO.md](DEMO.md) | Live demo page: themes, motion, schema playground, mock CMS |
| [RELEASE.md](RELEASE.md) | Version bumps, changelog, tags, npm publish, SRI, CEM checklist |

## Architecture & decisions

| Document | What it covers |
| --- | --- |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | Narrative: why Web Components, Shadow DOM, schema, containers |
| [diagrams/architecture.md](diagrams/architecture.md) | Mermaid diagrams: data flow, deploy topology, theme layers |
| [adr/0001](adr/0001-web-component-over-framework.md) | Custom Element over framework |
| [adr/0002](adr/0002-shadow-dom-encapsulation.md) | Shadow DOM encapsulation |
| [adr/0003](adr/0003-schema-and-adapters.md) | Zod schema + adapter layer |
| [adr/0004](adr/0004-agpl-licence.md) | AGPL + canary provenance |
| [adr/0005](adr/0005-container-queries.md) | Container-query responsiveness |
| [adr/0006](adr/0006-page-themes-and-motion.md) | Demo page themes & motion (not shipped in npm API) |

## CMS cookbooks

Step-by-step integration guides with copy-paste snippets:

- [Cookbook index](cookbook/README.md) — choose your integration pattern
- [WordPress](cookbook/wordpress.md) — classic/block themes, REST, imperative mount
- [Contentful](cookbook/contentful.md) — content model, Delivery API, static JSON webhook pattern
- [Sanity](cookbook/sanity.md) — GROQ, HTTP API, Studio preview workflow

## Operations

| Document | What it covers |
| --- | --- |
| [BRANCHING.md](BRANCHING.md) | `master` vs feature branches, PR previews, branch hygiene |
| [DEPENDENCY-UPGRADES.md](DEPENDENCY-UPGRADES.md) | Deferred major bumps and security audit notes |
| [openapi/cms-api.json](openapi/cms-api.json) | OpenAPI schema for the mock CMS Worker |
| [loc-report.md](loc-report.md) | Generated LOC snapshot (`npm run loc:report`) |

## Policy & quality

| Document | What it covers |
| --- | --- |
| [ACCESSIBILITY.md](../ACCESSIBILITY.md) | WCAG mapping, keyboard, screen readers, known limits |
| [SECURITY.md](../SECURITY.md) | Vulnerability reporting, XSS surface, canary verification |
| [CHANGELOG.md](../CHANGELOG.md) | Version history (Keep a Changelog) |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | PR checklist, commit style, ground rules |

## Generated artefacts (not hand-edited)

| Path | Generate with |
| --- | --- |
| `docs/api/` | `npm run docs:api` (TypeDoc) |
| `custom-elements.json` | `npm run cem` / `npm run build:lib` |
| `.vscode/html-custom-data.json` | derived from CEM |

CI uploads TypeDoc and coverage as workflow artifacts; they are not hosted as a
public site yet.

## Live endpoints

| Service | URL |
| --- | --- |
| Demo (Pages) | [501fun.humza-butt.space](https://501fun.humza-butt.space) |
| Mock CMS | [cms.501fun.humza-butt.space/api/cards](https://cms.501fun.humza-butt.space/api/cards) |
| OpenAPI | [cms.501fun.humza-butt.space/openapi.json](https://cms.501fun.humza-butt.space/openapi.json) |

---

**Package:** `@humza/feature-cards` · **Version:** see [README](../README.md) ·
**Licence:** AGPL-3.0-only
