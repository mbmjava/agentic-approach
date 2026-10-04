# GitLab adapter

The GitLab counterpart of the GitHub review flow. Same **contract** (rubric + `VERDICT/CHECKLIST/FINDINGS`),
same layering: the **gate** is GitLab-native, the **advisor** is [n8n](https://n8n.io) (provider-neutral).
See [Independent review](independent-review.md) for the portable parts; this topic is only the plumbing.

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

## Trigger

MR events (opened / updated). A **webhook to a local n8n** has the same reachability problem as GitHub
(`localhost` isn't public), so either:

- let the advisor **poll** open MRs (the GitLab n8n workflow does this), or
- expose n8n via a tunnel and use a Webhook Trigger, or
- have a `.gitlab-ci.yml` job call n8n on MR events.

## Advisor (n8n, provider-neutral)

Use the **GitLab variant** of the review workflow (`tools/n8n/pr-review-gitlab.workflow.json` in the
reference repo) — it swaps the GitHub nodes for GitLab ones and keeps the same reviewer and output
contract:

`Schedule → List open MRs → Get MR changes → Build diff → Prepare request → Review → Post review note`

- `PROJECT_ID` = URL-encoded `group%2Fproject` or the numeric id; `PRIVATE-TOKEN` header-auth credential.
- The **Review** node is the swap point: an agent today, a human step later.
- Self-hosted GitLab: replace `https://gitlab.com` with your host.

The advisor is advisory — it comments on the MR. The protected-branch pipeline is what actually gates.

## Checklist

- [ ] `CODEOWNERS` present; harness/infra paths routed to an owner.
- [ ] `.gitlab-ci.yml` runs the real checks (build, tests, docs, lint).
- [ ] Protected branches + required pipeline gate `main`/`develop`.
- [ ] Approval rules set (0 while solo; raise with a team).
- [ ] n8n advisor connected (poll or webhook) and commenting; reviewer model chosen.

## Caveats

- Same as GitHub: start advisory/comment-only, make it required only if it proves reliable.
- Keep the advisor model independent of the author where you can; an agent and a human both work behind
  the same contract.
