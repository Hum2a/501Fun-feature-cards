# ADR-0004: AGPL-3.0-only licence with provenance markers

| | |
| --- | --- |
| **Status** | Accepted |
| **Date** | 2026-06-12 |
| **Related** | [SECURITY.md](../../SECURITY.md) |

## Context

This component is original portfolio / hiring work published publicly. Goals:

1. **Maximise evaluability** — reviewers can read, run, and deploy freely
2. **Protect authorship** — detect unattributed commercial reuse
3. **Clarify obligations** — network deployers know copyleft applies

### Licence candidates

| Licence | Evaluation freedom | Network copyleft | Commercial closed use |
| --- | --- | --- | --- |
| MIT / BSD | High | None | Allowed |
| GPL-3.0 | High | Weak (distribution) | Restricted |
| **AGPL-3.0** | **High** | **Strong (SaaS/network)** | **Requires source offer or separate licence** |
| Proprietary | Low | N/A | Blocked without licence |

## Decision

1. License repository **AGPL-3.0-only**
2. Summarise obligations in plain English — `NOTICE`, README
3. Embed **inert authorship markers** (canary watermark) in bundles and render output
4. Ship read-only verifier — `npm run canary:verify -- <url>`

Markers are **evidence, not enforcement malware**:

- No network calls
- No fingerprinting users
- No behaviour/layout/performance impact

## Rationale

MIT maximises adoption but offers no leverage if the component is deployed
commercially without attribution or source offers. AGPL closes the **network
use loophole** of GPL while keeping evaluation frictionless.

Canary markers upgrade "that looks like my code" to **machine-verifiable**
provenance without DRM or phone-home logic.

## Consequences

### Positive

- Hiring reviewers face zero licence friction for evaluation
- Deployers understand network-use obligations upfront
- Author can verify served sites with passive HTML/JS scan
- Aligns with open-source ethics for portfolio work

### Negative

- AGPL deters some corporate adopters who won't share source
- Requires separate commercial licence conversation for closed deployments
- Watermark module is **immutable** by project policy — contributors must not remove
- Verifier may false-negative if bundles are heavily re-bundled without markers

## Marker classes

| Class | Location |
| --- | --- |
| Provenance constant | Bundled JS (tree-shaken reference) |
| Zero-width `data-fc-sig` | Rendered section element |
| Shadow HTML comment | UUID + licence string |
| Non-enumerable class property | Runtime introspection |

Details: [SECURITY.md](../../SECURITY.md).

## Compliance

- `src/watermark.ts` protected in AGENTS.md golden rules
- README licence section links NOTICE + SECURITY
- CI post-deploy canary smoke on production

## References

- [GNU AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.en.html)
- [ADR-0001](0001-web-component-over-framework.md) — distribution model
