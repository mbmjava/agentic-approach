---
title: Specification review checklist
type: standard
status: active
owner: mbmjava
last_updated: 2026-10-08
tags: [standard, review, specs, agents]
---

# Specification review checklist

The reviewer applies this rubric to a requirement. It checks whether the requirement is ready to
implement; it does not invent product intent or replace the owner's acceptance.

## Required input

- The canonical requirement path and its `spec_id`.
- The spec's linked plans, ADRs, and known-issue entries needed to verify references.

If the requirement cannot be located, return `request-changes` or `escalate` rather than guessing.

## Review items

Report each item as `pass`, `fail`, or `n-a`, with concise evidence:

1. **Identity and traceability** — the spec ID and `spec_type` are explicit; the authorized owner selected
   exactly one `approval_mode: human | judge` during spec creation; requirements (`R-<n>`), acceptance
   criteria (`AC-<n>`), linked decisions, and K issues are stable and internally consistent.
2. **Intent and boundaries** — the problem, goals, non-goals, and scope/interfaces agree; unresolved
   product intent is visible rather than inferred.
3. **Testability** — requirements are testable, acceptance criteria observable, and each material
   requirement maps to one or more acceptance criteria.
4. **Edge cases and dependencies** — failure paths, constraints, upstream/downstream dependencies, and
   required interfaces are covered or explicitly left as owned open questions.
5. **Risk and blast radius** — security/privacy, affected systems, rollback/recovery, and relevant K
   issues are identified without copying the register's issue details.
6. **Execution readiness** — required gates, file scope, UAT, deployment, and rollback expectations
   are stated at the level needed to implement the requirement.
7. **Document integrity** — required sections and links are present; the spec records agreed intent, not
   an ideation transcript; no contradictory or unsupported claims are introduced.

An explicit open question does not fail review merely because it remains unanswered. It blocks only when
the implementation depends on that decision or the spec hides a decision that belongs to the owner.

## Verdicts and result format

- `approve` — no blocking failures; the requirement is sufficiently clear and testable. This is a
  readiness recommendation, not product-intent approval or merge authority.
- `request-changes` — specific, fixable omissions or contradictions are cited by section/ID, with a
  concrete correction or question.
- `escalate` — product intent, risk acceptance, scope, or a policy decision belongs to the owner; do not guess.

Return only this structured result:

```text
SPEC_ID: <spec_id>
VERDICT: approve | request-changes | escalate
CHECKLIST: identity=pass|fail|n-a, intent=pass|fail|n-a, testability=pass|fail|n-a,
  dependencies=pass|fail|n-a, risk=pass|fail|n-a, execution=pass|fail|n-a,
  document-integrity=pass|fail|n-a
FINDINGS:
- [blocker|major|minor] <section/R-id/AC-id> — <evidence path:line>; <problem>; <specific correction or question>
```

If there are no findings, write `FINDINGS: none`. Echo the supplied `SPEC_ID`; never emit chain-of-thought,
raw prompts, secrets, or unrelated file contents.

## Authority boundary

The reviewer is read-only: it cannot edit the spec, update its status, or approve product intent. The
orchestrator owns the state transition, and the owner owns unresolved intent and final acceptance.
