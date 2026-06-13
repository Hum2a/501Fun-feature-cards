---
name: Feature request
about: Propose an enhancement
title: 'feat: '
labels: enhancement
---

## Problem

<!-- What can't you do today? Who is affected (integrators, content editors, a11y users)? -->

## Proposed solution

<!-- Describe the API or behaviour you'd like. -->

## Project constraints

This project is opinionated — proposals should respect:

- [ ] **Zero new runtime dependencies** (Zod is the only bundled dep today)
- [ ] **Native browser APIs** in shipped code — no framework in core bundle
- [ ] **Accessibility** — must not regress axe zero-violation gate
- [ ] **Progressive enhancement** — no-JS path must remain viable
- [ ] **Fail safe** — bad data emits events; does not throw

## Alternatives considered

<!-- Other ways to solve the problem — adapter? host-page CSS? wrapper? -->

## Scope suggestion

- [ ] Public API change (needs README + SCHEMA.md + tests)
- [ ] New CMS adapter (needs cookbook + contract tests)
- [ ] Demo-only (themes/motion — not npm API)
- [ ] Documentation only

## Additional context

<!-- Links, mockups, prior art in other design systems -->
