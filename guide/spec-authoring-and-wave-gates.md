# Spec authoring and wave gates

Separate **thinking about work** from **authorizing implementation**. A chat, prototype, or research
conversation can explore intent without creating a requirement or granting merge authority. When the owner is
ready to start durable implementation, formalize the unit of work and choose its approval mode.

## Discuss first; formalize when ready

A useful command family has one light discussion mode and typed formalizers:

| Stage | Example command | Result |
| --- | --- | --- |
| Explore | `/vibe` | Conversation only; no spec or approval choice is created. |
| Formalize a feature | `/feature` | A feature spec, using a shared base interview. |
| Formalize an improvement | `/enhancement` | An improvement spec, using the same base interview. |
| Formalize a defect | `/bugfix` | A bugfix spec with reproduction and regression-test criteria. |
| Formalize platform work | `/infra` | An infrastructure/platform spec with rollout and rollback. |
| Formalize an investigation | `/research` | A research spec with a question, evidence plan, and time-box. |

These are **examples from TagWell**, not portable command syntax. OpenCode and Claude Code define commands and
skills differently; keep their adapters local while preserving the same user-facing distinction.

## Choose approval authority in the spec

When the owner formalizes a requirement, ask explicitly who may approve the work. Store the choice in the
canonical requirement, alongside its stable ID:

```yaml
spec_id: PROJECT-SPEC-0042
approval_mode: human # or judge
```

- **`human`** means a person approves and merges; a judge may advise but cannot authorize the merge.
- **`judge`** means the owner has authorized a judge verdict to be one input to the merge decision. It does not
  mean “the judge can always merge”: CI, branch eligibility, provider protection, head-SHA checks, and any
  project-specific human overrides still apply.

The mode is selected **when the spec is created**, not improvised at PR time or toggled separately for each
wave. If the owner later amends it, make that a reviewed, traceable spec change and define which in-flight work
it affects. Missing, invalid, or untrusted mode data must fail closed; do not infer `judge` from a label,
branch name, PR text, or a repository default.

## Preflight before implementation

For a project that adopts spec-gated implementation, run a small preflight before implementation or worker
dispatch. It should:

1. Verify that the approved spec exists on a **trusted ref** and has one valid `spec_id` and `approval_mode`.
2. Return the trusted ref/SHA and mode; record the spec ID and mode in the active plan or handoff.
3. Stop the wave if the mode is missing, duplicated, malformed, draft, superseded, or cannot be verified.

Discussion and spec authoring can happen before preflight. A preflight validates the earlier decision; it does
not ask the agent to choose authority again. The appropriate gate for small or mechanical work remains a
project policy decision: do not impose heavyweight specs on a floor lane unless the project intentionally
requires them.

## Keep verdict, authority, and enforcement separate

The author implements; an independent reviewer finds defects; a separate, read-only judge decides whether its
criteria are met; a deterministic actuator applies the policy. The judge must not edit, test, set its own
authority, or bypass the provider.

For a judge-mode merge, the intended condition is explicit:

```
approved spec says judge
AND required CI is green
AND independent judge approves
AND target branch is eligible
AND the live head is still the exact judged SHA
```

A dry-run decision script is useful evidence, but it is not itself a provider merge gate. If people can use the
GitHub/GitLab UI to merge around the script, put the judge result in a provider-required status check (and
restrict bypass) before claiming that the judge is mandatory. An orchestrator that manually launches the judge
has a **judge-capable path**, not an automatic judge gate.

See [approval authority](approval-authority.md) for the policy and TagWell’s current implementation limits,
[independent review](independent-review.md) for reviewer/judge separation, and [delegate safely](delegate-safely.md)
for assignment boundaries.
