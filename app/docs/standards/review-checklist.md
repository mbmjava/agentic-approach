---
title: Review checklist
type: standard
status: active
owner: mbmjava
last_updated: 2026-10-04
tags: [process, review, quality]
---

# Review checklist

The stable rubric a reviewer applies to a change. It is deliberately reviewer-agnostic: an agent
(`pr-reviewer`) or a human developer works from this same list and returns the same output, so the
reviewer can be swapped without changing the flow.

Output contract (from any reviewer): `VERDICT: approve | request-changes | comment`, a per-item
`pass|fail|n-a` result, and findings as `[severity] path:line — problem / fix`.

## Correctness and intent
- The change does what the PR/acceptance says, and nothing it was not asked to do.
- Edge cases, error paths, and boundary conditions are handled or explicitly out of scope.
- No behavior change smuggled in under a refactor.

## Tests and evidence
- New/changed behavior has a focused test; bug fixes have a regression test.
- The claimed evidence matches the change (command + result), and "verified" vs "not verified" is separated.
- Claims that need the live stack are marked **not verified** if they were not run.

## Documentation
- Durable docs are updated **in the same commit** as the behavior they describe (`docs/standards/documentation.md`).
- Superseded or contradicted notes are **deleted**, not paraphrased; no second copy left behind.
- The known-issues register reflects any newly accepted limitation (schema intact).

## Scope and contracts
- The diff stays within the declared file scope; no unrelated edits.
- Shared contracts (interfaces, records, wire shapes, module boundaries) are respected or changed deliberately.
- Hexagonal layout holds: dependencies point inward (`adapter -> application -> domain`) and the domain has no framework or infrastructure imports.

## Simplicity and anti-slop
- No dead code, unused deps, speculative abstractions, or needless new dependencies.
- Comments explain *why*, not *what*; no marketing language.
- Prefers the standard library / existing patterns over new machinery.

## Harness and infrastructure (owner review required)
- Changes to `AGENTS.md`, `.opencode/**`, `.github/**`, `scripts/check-docs.mjs`,
  `scripts/docs-report.mjs`, `pom.xml`, or `CLAUDE.md` are flagged for owner review — the harness is
  code under change control.
- Bounded wrappers keep their contract (timeout, process-tree cleanup, honest exit status).

## Boundaries
- No credentials or local secrets in the diff; `.env.local`/`.opencode.json` untouched.
- No production or shared-environment operations in the PR.
