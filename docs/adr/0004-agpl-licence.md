# ADR-0004: AGPL-3.0-only licence with provenance markers

- Status: accepted
- Date: 2026-06-12

## Context

This component is original work produced for a hiring exercise and
published publicly. It should be freely usable for evaluation and learning,
while protecting the author if the code is deployed commercially without
engagement. Candidate licences: MIT/BSD (maximally permissive), GPL-3.0
(copyleft, but with a network-use gap), AGPL-3.0 (copyleft including
network use), or proprietary/no licence.

## Decision

License the repository **AGPL-3.0-only**, with the obligation summarised in
plain English in `NOTICE` and the README. Embed inert authorship markers
(UUID constant, zero-width signature, shadow-root comment, non-enumerable
class property — see `SECURITY.md`) plus a read-only verifier CLI
(`npm run canary:verify`).

## Consequences

- Anyone may read, run, and evaluate the code freely; that includes the
  hiring team, with nothing in their way.
- Serving the component to users — including as part of a website — is
  network use: a deployer of a modified version must offer its source under
  the AGPL. Commercial closed-source use requires negotiating a separate
  licence with the author.
- The canary markers turn "that looks like my component" into verifiable
  evidence, entirely passively: they alter no behaviour and transmit
  nothing. Evidence, not sabotage.
- Trade-off accepted: AGPL deters some adoption that MIT would invite.
  For a portfolio/interview artefact, authorship protection outweighs
  adoption maximisation.
