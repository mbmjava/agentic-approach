# GitLab adapter

The GitLab counterpart of the review flow. Same **contract** (rubric + `VERDICT/CHECKLIST/FINDINGS`),
same layering: the **gate** is GitLab-native; the **review and approval loop** runs in the
**orchestrator** (the agent session) behind a forge port. See [Independent review](independent-review.md)
for the portable parts; this topic is only the plumbing.

## Gate (GitLab-native)

Matches the GitHub enforcement rungs with GitLab features:

| Concern | GitLab feature |
| --- | --- |
| Merge gate | **Protected branches** + **required pipelines** on `main`/`develop` |
| Review gate | **Merge request approval rules** (raise `required approvals` when a team exists) |
| Ownership | **`CODEOWNERS`** (routes to owners; drives approval rules where configured) |
| Required checks | Jobs in `.gitlab-ci.yml` marked for the pipeline; a failed required job blocks merge |

Make the pipeline the gate: a failing job on a protected branch must block the merge, or CI is decoration.

## CI (`.gitlab-ci.yml`)

Mirror the checks you run elsewhere — build/tests, the docs check, lint, and any generated-index check —
as pipeline jobs. Keep them fast and stable; a flaky required job gets bypassed.

## Reviewer/loop (orchestrator + forge port)

The reviewer is **not** a separate service. The orchestrator runs the same sequence on the MR head —
resolve authority → review → judge → decide → merge — and stays provider-neutral by swapping one adapter:
the **forge port** `scripts/agentic/forge/gitlab.mjs` implements the GitLab REST calls behind the same
interface as the GitHub adapter (`getChange`, `getChecks`, `postComment`, `setLabel`, `requestHumanReview`,
`merge`). Set `forge.provider: "gitlab"` and `forge.repo` in `.agentic/config.json`.

Because MR events do not reach a local orchestrator, trigger the loop from somewhere that already sees the
MR — a `.gitlab-ci.yml` job, a scheduled/manual run, or the orchestrator acting directly. The gate is still
the protected-branch pipeline. See the [approval loop runbook](../app/docs/runbooks/approval-loop.md).

## Checklist

- [ ] `CODEOWNERS` present; harness/infra paths routed to an owner.
- [ ] `.gitlab-ci.yml` runs the real checks (build, tests, docs, lint).
- [ ] Protected branches + required pipeline gate `main`/`develop`.
- [ ] Approval rules set (0 while solo; raise with a team).
- [ ] `forge.provider: "gitlab"` + `forge.repo` set; the loop runs on the MR head.

## Caveats

- Start advisory/comment-only, then make the required pipeline the gate once the reviewer is reliable.
- Keep the reviewer model independent of the author where you can; an agent and a human both work behind
  the same contract.
- The GitLab forge adapter is a **stub** in the starter (`forge/gitlab.mjs`) — implement it over the GitLab
  REST API when you adopt GitLab.
