# Security

## Reporting a vulnerability

Email **Humzab1711@hotmail.com** with a description and reproduction steps.
You will get an acknowledgement within 72 hours. Please do not open public
issues for security reports.

## Threat surface

The component never uses `innerHTML` with data — all CMS content is set via
`textContent` and validated through a Zod schema first, so card data cannot
inject markup or script. The `src` attribute fetches JSON with the page's
default credentials policy; treat the endpoint like any other content URL.
The mock Worker is demo infrastructure and serves static JSON only.

## Authorship & licensing (canary watermark)

This codebase embeds **non-functional authorship markers** that prove where
the code originated without affecting behaviour, layout, performance, or
privacy. Nothing is collected or transmitted — the markers are inert
strings:

1. A frozen provenance constant (UUID, repo URL, timestamp, SPDX
   `AGPL-3.0-only` tag) referenced by the element so bundlers keep it.
2. A zero-width-character signature in a `data-fc-sig` attribute on the
   rendered section — invisible to users, greppable in served HTML.
3. An HTML comment in the shadow root naming the UUID and the licence.
4. A non-enumerable `__FEATURE_CARDS_PROVENANCE__` property on the element
   class.

### Verifying a deployment

```sh
npm run canary:verify -- https://example.com
```

The verifier fetches the URL's HTML (and same-page script bundles), scans
for the three marker classes, and prints a `MATCH` / `NO MATCH` report. It
is strictly **read-only**: it fetches and reports, nothing else.

A `MATCH` against a site means that site is serving this AGPL-3.0-licensed
code. Operators of such a site are obligated to provide their users the
complete corresponding source under the same licence (see `NOTICE`).

### Maintainer notes

- The UUID lives in `src/watermark.ts` (`CANARY_UUID`). Rotate it per
  release if you want per-release provenance, and keep a private record of
  which UUID shipped when.
- The watermark module must never be removed or altered — see `AGENTS.md`.
