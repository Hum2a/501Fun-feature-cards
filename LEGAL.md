# Legal notice & enforcement

> **This document is operational guidance, not legal advice.** For formal
> enforcement strategy, consult a solicitor qualified in intellectual property
> law (UK: copyright and trade marks; US: copyright and DMCA if applicable).

## Copyright owner

| Field | Value |
| --- | --- |
| **Work** | *feature-cards* — `@humza/feature-cards` Web Component, demo, tooling |
| **Author & copyright holder** | **Humza Butt** |
| **Contact** | Humzab1711@hotmail.com |
| **Repository** | https://github.com/Hum2a/feature-cards |
| **First publication** | 2026 |
| **Licence** | [GNU Affero General Public License v3.0 only (AGPL-3.0-only)](LICENSE) |

Under the [Copyright, Designs and Patents Act 1988](https://www.legislation.gov.uk/ukpga/1988/48/contents) (UK), copyright arises automatically when original work is created and fixed. You do **not** need registration for rights to exist — but registration and consistent marking strengthen evidence in disputes.

Supporting files: [COPYRIGHT](COPYRIGHT) · [NOTICE](NOTICE) · [TRADEMARK.md](TRADEMARK.md)

## What is permitted

AGPL-3.0-only allows anyone to **use, study, modify, and redistribute** this
software **provided they comply with the licence**, including:

- Preserve copyright and licence notices
- State significant changes
- **Network use (SaaS, public websites):** offer users the **complete corresponding source** of modified versions under the same licence

See [NOTICE](NOTICE) for a plain-English summary.

## What is **not** permitted (actionable violations)

The following are common infringement scenarios this project is structured to
challenge:

| Violation | Why it is actionable |
| --- | --- |
| Copying source or bundles **without** licence notices | Breach of copyright (unauthorised reproduction) + licence violation |
| Deploying modified code as a network service **without** source offer | **AGPL §13** violation — copyleft obligation |
| Stripping canary watermarks or copyright banners | Evidence of **intentional** circumvention; strengthens bad-faith argument |
| Republishing as `@someone/feature-cards` on npm | Trademark confusion + copyright + npm ToS |
| Claiming authorship or presenting as original work | Passing off / moral rights (UK) / fraud in hiring contexts |
| Closed-source commercial use without a **commercial licence** | Requires separate written agreement — see [COMMERCIAL-LICENSING.md](COMMERCIAL-LICENSING.md) |

## Evidence this repository preserves

Deliberate, auditable chain of authorship:

1. **Git history** — timestamped commits under your control
2. **SPDX headers** on every source file (`AGPL-3.0-only`) — checked in CI
3. **[LICENSE](LICENSE)** — full AGPL text shipped in npm tarball
4. **Bundle banners** — minified JS includes copyright + licence reference
5. **Canary watermark** — machine-verifiable markers in rendered output ([SECURITY.md](SECURITY.md))
6. **npm provenance** — publish attestation linking tarball to this repo (when enabled in release workflow)

Verify a live deployment:

```sh
npm run canary:verify -- https://example.com
```

A `MATCH` result is **technical evidence** that the deployment serves code
derived from this repository. It is not proof of licence compliance by itself,
but supports infringement and licence-breach claims when combined with other
evidence.

## If you believe your code was stolen

### 1. Document everything (before contacting anyone)

- URLs where the copy appears
- Screenshots / archive.org captures with dates
- `npm run canary:verify` output
- Side-by-side diffs or minified bundle comparison
- npm package name/version if republished
- WHOIS / hosting provider for the site

### 2. Contact the infringer (optional but often required)

Send a concise **cease-and-desist / licence-compliance notice** to the operator.
Template points to cover:

- You are the copyright holder
- The work is licensed under AGPL-3.0-only
- What they must do: attribute, publish source, or remove the work
- Deadline (commonly 7–14 days)
- Your contact email

Keep copies of all correspondence.

### 3. Platform takedowns

| Platform | Mechanism |
| --- | --- |
| **GitHub** | [Copyright claim (DMCA)](https://docs.github.com/en/site-policy/content-removal-policies/submitting-a-dmca-takedown-notice) — works for US hosts; GitHub accepts notices for copyright globally |
| **npm** | [Report policy violation](https://www.npmjs.com/policies/conduct) / support — republished packages, name squatting |
| **Cloudflare / CDN** | Abuse / copyright contact per provider |
| **University / employer** | Academic misconduct or IP policy if a student copied portfolio work |

GitHub DMCA notice must include (see GitHub’s form): identification of work,
identification of infringing material, your contact details, good-faith statement,
accuracy statement under penalty of perjury (US form), signature.

### 4. Report via this repository

Use the **[IP infringement issue template](.github/ISSUE_TEMPLATE/ip-infringement.yml)** for your own tracking, or email **Humzab1711@hotmail.com** with subject `IP: feature-cards`.

Do **not** post evidence of third-party infringement publicly if it contains personal data you are not authorised to share.

### 5. Formal legal action

If informal steps fail:

- **UK:** solicitor letter before action → Intellectual Property Enterprise Court (IPEC) for smaller claims, or High Court for larger damages
- **Register copyright** (optional): [UK IPO](https://www.gov.uk/register-copyright) — not required for rights to exist, but useful evidence
- **Trade mark** (optional): register *feature-cards* or logo if commercial brand value grows — see [TRADEMARK.md](TRADEMARK.md)

## Commercial licensing

Organisations that cannot comply with AGPL (closed source, no source offer) may
request a **separate commercial licence**. See [COMMERCIAL-LICENSING.md](COMMERCIAL-LICENSING.md).

## Demo site terms

The live demo at [501fun.humza-butt.space](https://501fun.humza-butt.space) is
governed by [TERMS_OF_USE.md](TERMS_OF_USE.md).

## Maintainer checklist

- [ ] Never merge PRs that remove `src/watermark.ts` or licence headers
- [ ] Run `npm run license:check` before release
- [ ] Keep `LICENSE`, `NOTICE`, `COPYRIGHT` in npm `files` list
- [ ] Consider UK IPO registration before major public launch
- [ ] Rotate `CANARY_UUID` per major release; keep private mapping log ([SECURITY.md](SECURITY.md))

## References

- [ADR-0004: AGPL licence decision](docs/adr/0004-agpl-licence.md)
- [GNU AGPL-3.0 FAQ](https://www.gnu.org/licenses/agpl-3.0.en.html)
- [SPDX AGPL-3.0-only](https://spdx.org/licenses/AGPL-3.0-only.html)
- [SECURITY.md — canary verification](SECURITY.md)
