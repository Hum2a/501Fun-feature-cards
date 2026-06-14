# Commercial licensing

The *feature-cards* npm package (`@humza/feature-cards`) is published under
**[AGPL-3.0-only](LICENSE)**. That works for open evaluation and copyleft
deployments, but **not** for organisations that need closed-source use.

**npm experiment:** Public package on npm + manual commercial agreements. No license
keys or private registry in v1 — see [docs/NPM.md](docs/NPM.md).

## Dual-licensing model

| Use case | Licence path | Cost |
| --- | --- | --- |
| OSS / can publish source | **AGPL-3.0-only** — `npm install @humza/feature-cards` | Free |
| Evaluation / portfolio review | AGPL — clone repo, run demo | Free |
| Internal proprietary tool | **Commercial — Internal tier** | Quote |
| SaaS / public site (no source offer) | **Commercial — SaaS tier** | Quote |
| Agency OEM / client deliverables | **Commercial — OEM tier** | Quote |

Until a signed commercial agreement exists, **only AGPL terms apply**.

## Product tiers (starting points for quotes)

These are **guide prices** for scoping conversations — every deal is quoted individually.

| Tier | Typical buyer | Includes | Guide price |
| --- | --- | --- | --- |
| **Internal** | One company, staff-only tools | 1 legal entity, no redistribution, 1–3 production apps | £500–£2,000 perpetual or £200–£500/yr |
| **SaaS** | Product with end users | Named product, production deploy without AGPL source offer | £2,000–£10,000/yr |
| **OEM** | Agency / vendor bundling for clients | Embedded in deliverables, multiple client deploys | £5,000+ or custom |

Add-ons (priced separately): white-label (no attribution), priority support, major-version upgrade rights.

## How to request a quote

Email **Humzab1711@hotmail.com** with subject `Commercial licence: feature-cards`.

### Quote request checklist

Copy this into your email:

```
1. Company legal name + website:
2. Contact name + role:
3. Tier (Internal / SaaS / OEM):
4. Product description (what ships to users):
5. Production URLs or app names:
6. Number of production environments:
7. Will you modify the source? (yes/no — describe if yes):
8. Developers with access (approx):
9. Term preference (perpetual / annual):
10. Required npm version pin (or "latest at signing"):
```

## Sales workflow

```mermaid
sequenceDiagram
  participant B as Buyer
  participant Y as You
  participant N as npm registry

  B->>Y: Quote request email
  Y->>B: Scope call + written quote
  B->>Y: Signed agreement + payment
  Y->>B: License Grant Letter + version pin
  B->>N: npm install @humza/feature-cards@x.y.z
```

1. **Enquiry** — buyer sends checklist
2. **Scope** — 15-minute call if needed; confirm tier and version pin
3. **Quote** — fixed fee in writing (email is fine pre-template)
4. **Contract** — solicitor-reviewed agreement ([DRAFT template](docs/licenses/COMMERCIAL-LICENSE.template.md))
5. **Payment** — invoice (Stripe, bank transfer)
6. **Grant** — [License Grant Letter](docs/licenses/LICENSE-GRANT-LETTER.template.md) with `@humza/feature-cards@x.y.z`

**Never** grant commercial rights before payment and signature.

## What commercial customers receive

| Deliverable | Detail |
| --- | --- |
| Signed agreement + grant letter | AGPL waived for their scope only |
| npm install instructions | Same public package — pin licensed version |
| Optional | tarball of exact git tag if they want offline archive |

No separate “commercial build” is required for the experiment.

## Publishing on npm (maintainers)

First-time setup and publish commands: **[docs/NPM.md](docs/NPM.md)**.

Preflight before any publish:

```sh
npm run pack:verify
npm run release:package:dry
```

## Why AGPL by default

See [ADR-0004](docs/adr/0004-agpl-licence.md). Evaluators install freely; closed
commercial deployers must comply with copyleft or purchase a commercial licence.

## Related

- [docs/NPM.md](docs/NPM.md) — npm scope, publish, tarball contents
- [LEGAL.md](LEGAL.md) — infringement if someone uses without any licence
- [NOTICE](NOTICE) — plain-English AGPL obligations
- [docs/licenses/](docs/licenses/) — DRAFT templates for your solicitor
