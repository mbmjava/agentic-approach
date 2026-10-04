# n8n — PR review workflow

Automation for the agentic-workflow PR review flow: when a PR is open, produce an independent review
against [`docs/standards/review-checklist.md`](../../docs/standards/review-checklist.md) and post it as a
comment. The reviewer is **swappable** — an agent today, a human later (see the swap point).

n8n runs as `tw-n8n` in the `tw` compose stack, routed at **http://n8n.localhost** (direct:
http://localhost:5678). Open it once to create the owner account.

n8n Assistant / Agents run code in a separate **code sandbox** service — see
[`sandbox-setup.md`](sandbox-setup.md) to stand it up on a host n8n can reach.

## Why polling, not a webhook

GitHub cannot deliver webhooks to `n8n.localhost` (loopback). This workflow **polls** open PRs on a
schedule instead, so no public URL is needed. If you later expose n8n through a tunnel, you can swap
the Schedule Trigger for a Webhook Trigger and set `N8N_WEBHOOK_URL` to the public URL.

**Provider-neutral by design.** n8n has both GitHub and GitLab nodes, so the same flow
(`diff → reviewer → comment`) can serve a GitLab repo by swapping the GitHub nodes for GitLab ones. Use
this when one review flow must span providers; keep the merge **gate** in the provider (GitHub branch
protection / GitLab protected branches), not here.

## Import

1. n8n → **Import from File** → `pr-review.workflow.json` (GitHub) or `pr-review-gitlab.workflow.json`
   (GitLab).
2. Replace `OWNER/REPO` in the three HTTP nodes with your `owner/repo`.
3. Create two **Header Auth** credentials and attach them:
   - `GitHub` → header `Authorization: Bearer <token>` (fine-grained PAT: Pull requests read, Issues write).
   - `OpenRouter` → header `Authorization: Bearer <key>`.
   (The JSON references placeholder credential ids; pick the credentials in each node after import.)
4. Confirm the model in the **Prepare request** node matches the `reviewer` entry in
   [`.opencode/models.json`](../../.opencode/models.json).
5. Activate the workflow.

## Nodes

`Schedule Trigger → List open PRs → Get PR diff → Prepare request → Review → Post review comment`

## The swap point

The **Review** node is the swap point. Today it calls OpenRouter with the review rubric. To hand review
to a human, replace it with a notification/approval step (Slack, email, or a GitHub review request) that
returns the same contract: `VERDICT` / `CHECKLIST` / `FINDINGS`. Nothing downstream changes. See the
playbook's "Independent review" topic for the contract.

## Caveats (this is a starting point)

- **No dedup yet.** Each run re-reviews every open PR. Add a marker (a label, or a check for an existing
  bot comment) before this is run on a schedule.
- **Direct LLM call, not this repository's `pr-reviewer` agent.** The Review node calls OpenRouter directly. To use the
  `pr-reviewer` agent instead, have the node call a headless agent (`opencode run`) — or swap to a human.
- **Verify after import.** The JSON imports as a workflow; confirm the URLs, credentials, and the diff
  response format in the n8n editor before activating.
