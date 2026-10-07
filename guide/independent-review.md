# Independent review (a swappable reviewer)

An independent review is a check that runs against a **finished change**—usually a pull request—by
someone who did not write it. Treat the reviewer as an **interface, not a person**: today an agent
fills the role, tomorrow a human developer does, and nothing else in the flow changes.

This is distinct from the author's own pre-commit pass. The author's review protects the change; an
independent review is the second pair of eyes, in a **fresh context**, ideally on a **different model**
from the one that wrote it.

## The review contract

Pin the input and the output, and the reviewer becomes swappable:

- **Input:** the diff, the change's description/acceptance, and the changed-file list. The reviewer may
  read the repository for context but must not rely on the author's reasoning.
- **Output:** a verdict (`approve` / `request-changes` / `comment`), a per-item result against a fixed
  checklist, and findings cited as `[severity] path:line — problem / fix`.

Put the checklist in a durable **review rubric** (one canonical page) so agent and human review the
same things. See [reusable templates](templates.md) for the shape.

## Reviewer rules

- **No authority.** The reviewer recommends; the user/orchestrator decides and merges.
- **Read-only.** No edits, no shell, no tests, no git. It reviews what it is given.
- **Separate from the author.** Fresh context; a different model where possible.
- **Evidence over opinion.** Cite `path:line`; separate verified from inference.
- **Proportional.** A tiny mechanical change gets a light pass; a cross-layer or harness change gets a
  deeper one.

## Rolling it out

1. **Comment-only.** Post the review as a comment on the change; do not block.
2. **Make it required** once it is reliable—an unreliable gate gets ignored, then disabled.
3. **Swap the implementation.** Start with an agent; move to a human when the team has one, without
   changing the contract or the flow.

## Reviewer vs judge

One read-only pass is a *reviewer*. Trusted **approval** adds a second, independent, **adversarial judge**
that decides whether the change is safe to approve — it re-checks the review, the CI status, and the
acceptance criteria, and fails closed. See [Approval authority](approval-authority.md).

## Provider portability (GitHub, GitLab, …)

The review **contract is portable**; the **trigger and the merge gate are not**. Keep the rubric and the
output shape provider-neutral and adapt the plumbing:

| Concern | GitHub | GitLab |
| --- | --- | --- |
| Trigger | PR events / GitHub Actions | MR events / GitLab CI |
| Merge gate | Branch protection or rulesets with required status checks | Protected branches + required pipelines + MR approval rules |
| Ownership | `CODEOWNERS` | `CODEOWNERS` / approval rules |
| Provider plumbing | the forge adapter (`forge/github.mjs`) | the forge adapter (`forge/gitlab.mjs`) |

Two rules follow:

- **Put the gate in the provider, not in the reviewer.** Required-check enforcement is provider-native
  (GitHub branch protection; GitLab protected branches + required pipelines). A reviewer that only comments
  is advisory — it cannot block a merge. That is fine as a second pair of eyes, as long as the provider's
  protection still gates.
- **Keep one forge-neutral loop.** The reviewer runs in the **orchestrator** (the agent session) behind a
  forge port, so the same flow — resolve authority → review → judge → decide → merge — serves GitHub and
  GitLab by swapping one adapter. The reviewer itself stays the swappable role: agent today, human later.

**Concretely:** the orchestrator runs the loop on the PR/MR head; the provider decides what is *required*.
The [enforcement ladder](enforcement-and-cleanup.md) is provider-neutral: “required check” and “branch
protection” just have provider-specific names. See the [GitLab adapter](gitlab-adapter.md) for the plumbing.

## Wiring (the orchestrator runs the loop)

The flow is a short sequence of swappable steps, run by the orchestrator — no separate service:

`resolve authority → pr-reviewer (findings + verdict) → judge (adversarial decision) → apply (merge only on model + CI pass + judge approve)`

The **reviewer** and **judge** are swappable roles: today they are read-only subagent agents, later a human
can take either seat behind the same contract. The gate stays in the provider. The reference implementation
ships in the starter (`scripts/agentic/`; see the [approval loop runbook](../app/docs/runbooks/approval-loop.md)).

**Token permissions.** Reading a diff and posting a comment needs several permissions, not just “access to
the repo”: **Contents: Read** (the diff is generated from repository contents), **Pull requests: Read and
write** (comment/review on a PR), and **Issues: Read and write** (a PR conversation comment is an issue
comment). A classic token with `repo` covers all of it. A 403 “Resource not accessible by personal access
token” means a **missing permission**, not a missing repo.
