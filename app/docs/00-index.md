---
title: Documentation index
type: index
status: active
owner: mbmjava
last_updated: 2026-10-05
tags: [index, docs]
---

# Documentation index

Map of the durable docs (`docs/`) and the working state (`working-docs/`). This is the entry point
for finding the canonical page for a subject; the layout and lifecycle rules are in
[Documentation process](standards/documentation.md).

## Standards

- [Documentation process](standards/documentation.md) — what to write, where it lives, how it stays true.
- [Review checklist](standards/review-checklist.md) — the reviewer-agnostic rubric for a change.
- [Specification review checklist](standards/spec-review-checklist.md) — the readiness rubric for a requirement.
- [Static analysis](standards/static-analysis.md) — report-first analyzers, then selective gates.

Templates (copy-paste skeletons): [handoff](standards/templates/handoff.md),
[plan](standards/templates/plan.md), [decision](standards/templates/decision.md),
[requirement](standards/templates/requirement.md), [runbook](standards/templates/runbook.md).

## Requirements

- [Requirements](requirements/README.md) — where canonical specs live; the spec-driven flow.

## Runbooks

- [Approval loop](runbooks/approval-loop.md) — run the model-by-default approval loop (fails closed).

## Architecture

- [Package layout (hexagonal)](architecture/hexagonal.md) — where a feature's code goes and which way it depends.
- [Known issues](architecture/known-issues.md) — durable, accepted limitations (`K<n>` schema).

## Working state

- [Agent standards](../working-docs/agent-standards.md) — how agents work in this repo.
- [Handoff](../working-docs/handoff.md) — the one canonical, per-wave state (overwritten each wave).
- [Plans](../working-docs/plans/README.md) — one living plan per active workstream.
