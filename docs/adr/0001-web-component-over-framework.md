# ADR-0001: Web Component over framework component

- Status: accepted
- Date: 2026-06-12

## Context

The brief asks for a reusable, CMS-agnostic replacement for three
hard-coded card images, deployable to an unknown CMS "with minimal
adjustment", and encourages native browser APIs. Candidate approaches:
a framework component (React/Vue/Svelte), a meta-compiled component
(Lit/Stencil), a server-side partial, or a native Custom Element.

## Decision

Build a native **Custom Element** (`<feature-cards>`), authored in strict
TypeScript, shipped as vanilla ESM plus a self-registering IIFE bundle with
zero framework runtime.

## Consequences

- Works in any CMS or page that can load a script tag — WordPress themes,
  static HTML, server-rendered apps — with no framework version matrix.
- Consumers needing framework ergonomics can still wrap it trivially; the
  reverse (un-wrapping a React component for a PHP site) is not true.
- We own rendering, lifecycle, and accessibility details that a framework
  would otherwise provide; the test suite carries that responsibility.
- Lit/Stencil were rejected not on quality but on principle: at this
  component's scale their runtime/compiler buys little and contradicts the
  zero-dependency, native-API positioning.
