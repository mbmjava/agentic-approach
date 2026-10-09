# Approval authority (who may approve a change)

[Independent review](independent-review.md) gives you a reviewer. A separate **judge** can decide whether
the reviewed change satisfies its acceptance criteria and is safe to approve. Neither role should decide its
own authority. Set that authority deliberately, before implementation begins.

## Set the mode when the requirement is created

For a spec-driven project, put one explicit `approval_mode: human | judge` in the canonical requirement.
The authorized owner chooses it during spec authoring—not later from a PR label, branch name, or agent
suggestion. A discussion/prototype can happen first without creating a spec or selecting merge authority.

| Spec mode | Meaning | Merge behavior |
| --- | --- | --- |
| `human` | The change needs human approval. | The judge may advise, but automation does not merge. |
| `judge` | The owner has authorized the judge path for this spec. | Merge is eligible only after the required checks pass and the independent judge approves. |

The spec ID and mode travel together into the plan and PR/MR. Before an implementation wave, a preflight
checks that the approved spec exists and has a valid mode. At review time, resolve that same spec ID from a
**trusted, reviewed ref**, not from unreviewed PR text, labels, or the source-branch copy. Missing or
unverifiable authority fails closed; do not silently fall back to a model default.

Once a spec is approved, do not treat its mode as a per-wave toggle. If the owner needs to change it, use an
explicit, reviewed spec amendment and define which in-flight changes it affects. That amendment path and its
effect on open PRs must be clear in the target project.

Some projects add a manual `hold` or risk-path override that forces the human path. Keep such overrides
explicit and higher priority than `judge`; do not let labels grant judge authority. A single-owner project may
choose a simpler policy, but it should state that choice rather than imply that paths are protected when they
are not.

## Separate the verdict from the authority

The reviewer finds concrete defects; the **separate, read-only judge** rechecks the diff, acceptance criteria,
reviewer findings, and reported CI state. The judge returns `approve`, `request-changes`, or `escalate`; it
does not edit or merge. The orchestrator supplies that verdict to a deterministic decision/merge actuator.

For a judge-authorized merge, require all of the following:

```
approved spec mode = judge
AND required CI = pass
AND independent judge = approve
AND target branch is eligible
AND current PR/MR head = the exact judged head SHA
```

Any missing input, failed/pending check, non-approve verdict, moved head, or disallowed target blocks the
automated path. A human-authorized spec stays human even if the judge approves.

## The provider must enforce the gate

The actuator is not the merge gate. GitHub branch protection/rulesets or GitLab protected-branch and merge
rules must require the relevant CI and judge statuses. Otherwise a person with merge permission can use the
provider UI to merge before a manually launched judge responds. The actuator should independently validate
the same conditions, bind to the reviewed SHA and target, default to dry-run, and never bypass provider
protections. Provider status semantics differ; map them explicitly and fail closed on unknown or unexpectedly
skipped checks.

Before making an AI judge a required status, validate it on real, correctly labeled PR/MR outcomes. Track
false approvals separately from false rejections, and expand authority only when the project accepts the
measured risk. Calibration is a project policy decision—not evidence that a judge check is wired into CI.

## TagWell as an implementation example

TagWell's current flow formalizes work with `/vibe` for discussion and typed commands such as `/feature`,
`/enhancement`, `/bugfix`, `/infra`, and `/research`. The shared `spec-base` interview asks the owner for
`approval_mode` when the spec is created. `preflight.mjs` checks the approved spec on trusted `origin/develop`
before a new implementation wave; the PR/MR carries one `Spec ID:` reference.

The OpenCode/Claude `judge` is a read-only subagent that the orchestrator launches after the reviewer and CI
results are available. `apply.mjs` resolves the trusted spec mode and runs dry by default; `--allow-merge`
invokes the forge actuator only for `judge + CI pass + judge approve` and a guarded head SHA. The exported n8n
judge/reviewer workflows are currently parked, and GitHub branch protection requires CI checks but not a
judge status. Therefore TagWell has a **judge-capable orchestrated path**, but not a provider-enforced,
automatic judge gate: an authorized person could still merge through GitHub before the judge runs. The
GitLab adapter is also a stub. See the [approval-loop runbook](../app/docs/runbooks/approval-loop.md) for
current commands and limits.

This is evidence from one single-owner project, not a universal policy. Keep the shared contract portable;
put CLI command syntax and provider wiring in the corresponding adapter and starter.
