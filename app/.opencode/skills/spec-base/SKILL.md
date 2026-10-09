---
name: Spec base interview
description: Shared requirement interview; establishes stable identity, owner-approved approval mode, scope, acceptance, and gates.
metadata:
  opencode/autoinvoke: false
---

# Spec base interview

Run this interview one question at a time. Do not create the requirement until the owner has answered the
approval-mode question and the other required questions. Never infer product intent or approval authority.

1. Working title.
2. Stable `spec_id` and category/path under `docs/requirements/`.
3. Primary objective and why it matters now.
4. Scope, boundaries, and compatibility constraints.
5. **Approval mode — required at spec creation.** Ask the authorized owner to choose `human` or `judge` and
   explain the consequence. Record the value in requirement frontmatter; it is not a per-wave or PR-label toggle.
6. Testable requirements (`R-001`, …) and acceptance criteria (`AC-001`, …).
7. Edge cases, dependencies, risks, related known issues, and required gates.

Then create one canonical requirement from `docs/standards/templates/requirement.md`, set it to `draft`, add
it to `docs/requirements/README.md`, and run `node scripts/check-docs.mjs`. A spec review is optional and
manual. Before implementation or worker dispatch, the approved spec must pass
`node scripts/agentic/preflight.mjs --spec-id <spec_id>`.

The requirement is the source for intent, mode, `## Plan`, and `## Waves`. Do not create a separate plan for a
single-spec unit; use `working-docs/plans/` for a cross-cutting workstream that spans specs.
