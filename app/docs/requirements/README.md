---
title: Requirements
type: index
status: active
owner: mbmjava
last_updated: 2026-10-08
tags: [index, requirements, specs]
---

# Requirements

Canonical **requirements / specs** live here. A requirement is the durable record of *agreed intent*; the
chat or ideation that produced it is not. Discuss first if the idea is unsettled; once ready, use a typed
formalizer and the [requirement template](../standards/templates/requirement.md). The authorized owner
selects `approval_mode: human | judge` during spec creation; it is not a PR-time or per-wave toggle.

## Where a requirement goes

- One file per unit of intent: `docs/requirements/<area>/<feature>.md` (kebab-case; `<area>` is an optional
  product group such as `storage`). Keep `spec_id`, `spec_type`, and `approval_mode` in frontmatter.
- Link it to the durable records it touches: plans (`working-docs/plans/`), ADRs (`docs/decisions/`), and
  known issues (`docs/architecture/known-issues.md`, `K<n>`).

## Draft specifications

- [Spec-time approval and concurrent release candidates](approval-mode-auto-merge.md) — record the owner's
  human-or-judge choice when the spec is created; preflight before each implementation wave, then isolate,
  track, refresh, and promote concurrent RCs across GitHub and GitLab.

## Typed formalizers

- `/vibe` — explore an idea without writing a requirement or selecting authority.
- `/feature`, `/enhancement`, `/bugfix`, `/infra`, `/research` — use a shared base interview and focused
  type-specific questions; every formalizer asks for `approval_mode`.

The OpenCode and Claude Code command wrappers call mirrored skills. Commands standardize prompts; they do not
enforce policy by themselves.

## The spec-driven flow

1. **Discuss and formalize** — discussion creates no spec; a typed formalizer writes one canonical requirement
   with stable ID/type, owner-selected mode, testable requirements, acceptance, a `## Plan`, and `## Waves`.
2. **Spec review (optional, manual)** — run the `spec-reviewer` agent against
   [`spec-review-checklist.md`](../standards/spec-review-checklist.md) to check readiness before anyone
   builds. It is a readiness recommendation, not intent approval.
3. **Preflight** — after the approved spec is on the trusted ref, run
   `node scripts/agentic/preflight.mjs --spec-id <spec_id>` before implementation or worker dispatch. Preflight
   validates the spec-time choice; it does not select authority again.
4. **Implement/review** — bounded slices, verified; the read-only reviewer and, for judge-mode work, the
   separate judge provide evidence to the orchestrator (see the [approval loop runbook](../runbooks/approval-loop.md)).

## Rule

A requirement is the **contract for "done"**. If implementation disagrees with it, fix the requirement in the
same change — a spec that contradicts the behavior is deleted or updated, never left stale.
