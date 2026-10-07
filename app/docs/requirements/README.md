---
title: Requirements
type: index
status: active
owner: mbmjava
last_updated: 2026-10-07
tags: [index, requirements, specs]
---

# Requirements

Canonical **requirements / specs** live here. A requirement is the durable record of *agreed intent*; the
chat or ideation that produced it is not. Start from the
[requirement template](../standards/templates/requirement.md) and the `generate-prd` skill.

## Where a requirement goes

- One file per feature: `docs/requirements/<area>/<feature>.md` (kebab-case; `<area>` is an optional
  product group such as `storage`). Keep the spec's `spec_id` stable — it is how plans, ADRs, and known
  issues reference it.
- Link it to the durable records it touches: plans (`working-docs/plans/`), ADRs (`docs/decisions/`), and
  known issues (`docs/architecture/known-issues.md`, `K<n>`).

## The spec-driven flow

1. **Requirement** — write the spec here (problem, goals/non-goals, scope, `R-<n>` requirements,
   `AC-<n>` acceptance criteria, edge cases, risks, blast radius, execution readiness).
2. **Spec review (optional, manual)** — run the `spec-reviewer` agent against
   [`spec-review-checklist.md`](../standards/spec-review-checklist.md) to check readiness before anyone
   builds. It is a readiness recommendation, not intent approval.
3. **Plan** — slice the work into a living plan (`working-docs/plans/`).
4. **Implement** — bounded slices, verified; the change is reviewed by `pr-reviewer` and, when the loop is
   trusted, the `judge` decides approval (see the [approval loop runbook](../runbooks/approval-loop.md)).

## Rule

A requirement is the **contract for "done"**. If implementation disagrees with it, fix the requirement in the
same change — a spec that contradicts the behavior is deleted or updated, never left stale.
