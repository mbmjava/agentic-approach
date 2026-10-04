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

## Provider portability (GitHub, GitLab, …)

The review **contract is portable**; the **trigger and the merge gate are not**. Keep the rubric and the
output shape provider-neutral, and adapt the plumbing:

| Concern | GitHub | GitLab |
| --- | --- | --- |
| Trigger | PR events / GitHub Actions | MR events / GitLab CI |
| Merge gate | Branch protection or rulesets with required status checks | Protected branches + required pipelines + MR approval rules |
| Ownership | `CODEOWNERS` | `CODEOWNERS` / approval rules |
| Neutral orchestration | n8n (GitHub node) | n8n (GitLab node) |

Two rules follow:

- **Put the gate in the provider, not in an orchestrator.** Required-check enforcement is provider-native
  (GitHub branch protection; GitLab protected branches + required pipelines). A reviewer that lives only
  in n8n is advisory — it can comment, but it cannot block a merge. That is fine as a second pair of eyes,
  as long as the provider's protection still gates.
- **Use n8n when you want one review flow across providers.** n8n has both GitHub and GitLab nodes, so the
  same workflow (fetch diff → reviewer → post comment) can serve a GitHub repo and a GitLab repo by
  swapping one node. The reviewer itself is still the swappable role: agent today, human later.

Both providers' webhooks have the same reachability problem for a local runner (`localhost` isn't public),
so poll, or use a tunnel, or trigger from the provider's CI.

**Concretely:** a GitHub project uses the GitHub-native flow (Actions + branch protection). A GitLab
project mirrors it — GitLab CI + protected branches + MR approvals + `CODEOWNERS` — and reuses the same
rubric. Add n8n only for the neutral layer (one flow across providers, notifications, or calling a
reviewer agent). The [enforcement ladder](enforcement-and-cleanup.md) is provider-neutral: “required check”
and “branch protection” just have provider-specific names. See the [GitLab adapter](gitlab-adapter.md).

## Wiring (example: GitHub + n8n)

The flow is a pipeline of swappable nodes:

`PR event (webhook) → fetch diff + body → reviewer → post review comment + set status`

The **reviewer node** is the swap point: today it calls a headless agent (`opencode run` with a
read-only reviewer agent, or an LLM API); later it notifies a human and waits for the same contract
back. CI can carry the same rubric as an automated check.

**Advisor credentials (fine-grained token).** Reading a diff and posting a comment needs several
permissions, not just “access to the repo”: **Contents: Read** (the diff is generated from repository
contents), **Pull requests: Read and write** (comment/review on a PR), and **Issues: Read and write** (a
PR conversation comment is an issue comment). A classic token with `repo` covers all of it. A 403
“Resource not accessible by personal access token” means a **missing permission**, not a missing repo.

Provider specifics (required checks, `CODEOWNERS`, PR templates, dependency automation) are adapter
detail; keep the contract here tool-neutral. See [Bring the playbook into a project](bring-playbook-to-project.md).
