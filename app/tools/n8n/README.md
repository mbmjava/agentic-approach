# n8n — PR review workflow (provider-neutral judge)

When a PR is open, produce an independent review against
[`docs/standards/review-checklist.md`](../../docs/standards/review-checklist.md), comment it, and set a
commit status. The **judge** is a stable contract and is swappable — an agent today, a human later.

n8n runs as `tw-n8n` in the `tw` compose stack, routed at **http://n8n.localhost** (direct:
http://localhost:5678). Open it once to create the owner account.

n8n Assistant / Agents run code in a separate **code sandbox** service — see
[`sandbox-setup.md`](sandbox-setup.md) to stand it up on a host n8n can reach.

## Provider-neutral by design

Split the flow into a **stable contract** and **provider adapters**:

- **Contract (neutral):** input = diff + PR metadata; output = `VERDICT` / `CHECKLIST` / `FINDINGS`,
  a comment, a commit status, and a neutral visibility event (`channel, event, title, text, url, meta`).
- **Adapter (provider):** the List / Get-diff / Comment / Status nodes. `pr-review.workflow.json` is the
  **GitHub** adapter; `pr-review-gitlab.workflow.json` mirrors it for GitLab.
- **Gate:** keep the merge gate in the provider (GitHub branch protection / GitLab protected branches).
  n8n comments and sets a status; the provider decides what is *required*.

Only **GitHub** is exercised today; the contract does not change when GitLab is added.

## Flow

`Schedule → List open PRs → Dedup → Get PR diff → **Judge** (sub-workflow) → Post review comment →
Set commit status → Build digest → Notify (swap point) → Mark reviewed`

## Judge (provider-neutral sub-workflow)

`judge.workflow.json` owns the review logic so adapters don't: input = `diff` + `models`; output =
`{ verdict, disagreement, judgeCount, comment }`. It fans out one request per model (comma-separated
`models`, default `openai/gpt-6-luna`), then merges verdicts in a `Consensus` node.

- The **GitHub adapter** passes `models` = one model (single) or several (ensemble). The GitLab adapter,
  when built, calls the same judge — provider differences stay in the List/Get-diff/Comment/Status nodes.
- **Consensus:** any `request-changes` → `request-changes`; all approve → `approve`; else `comment`.
- **Escalation:** disagreement sets the commit status to `pending` and flags the event `escalate`. 

## Swap points (pluggable)

- **Judge** — the `Review` node. Agent now; replace it with a human approval step returning the same
  contract. Nothing downstream changes.
- **Visibility** — `Notify (swap point)` dispatches the neutral event to the **`notify` sub-workflow**
  (`notify.workflow.json`), which owns the channel adapters (Slack / Webhook / drop). Add a channel there,
  not in the review flow. **No channel is wired yet.**
- **Deployment** — later: the same neutral-event pattern feeds a deploy step.

## Ensemble (experimental)

`pr-review-ensemble.workflow.json` is a multi-judge variant: it fans the diff to N independent models,
parses each `VERDICT`, and merges them in a `Consensus` node.

- **Consensus:** any `request-changes` → `request-changes`; all `approve` → `approve`; otherwise
  `comment`. If the judges disagree, the review comment says so.
- **Models:** for now all three entries are `openai/gpt-6-luna` — **change later** to different families
  for real diversity (author ≠ judge; Claude is intentionally excluded).
- **Status context** is `n8n-ensemble` (vs `n8n-reviewer` for the single-model variant).
- **Escalation:** if the judges disagree, the commit status is set to `pending` (not success/failure) and
  the event is flagged `escalate` with `event: pr-review-escalation`, for the notify adapter to route to a
  human.
- **Not wired to a live repo yet:** the experimental copy is pointed at a test repo and left **inactive**.
  The live reviewer is unchanged, and no PRs are exercised yet.

Human escalation on judge disagreement is the next step.

## Commit status

`Build commit status` maps the verdict — `approve`/`comment` → `success`, `request-changes` → `failure`
— and `Set commit status` posts it to the PR head sha (context `n8n-reviewer`). Make it a **required
check** in provider branch protection once the judge is calibrated. Dedup is head-sha keyed, so a fix
push re-triggers review automatically.

## Health / error watcher

`health-error.workflow.json` is an **Error Trigger** workflow: when any workflow fails, it normalises the
error into the same neutral event (`event: workflow-error`, `escalate: true`) and dispatches it to the
notify adapter.

- Reference it as the workflow error handler: set it as the instance error workflow (Settings → Error
  Workflow) or per-workflow via `settings.errorWorkflow`.
- It must be **published** to be selectable as an error workflow.

## Calibration

`calibration.workflow.json` scores the judge against a **labeled corpus** (read-only): run the judge on
each diff, compare to the expected label, and report precision/recall for `request-changes`.

- Corpus is pluggable: the synthetic seed (clean / missing-tests / secret / contract-change / docs-only /
  scope-creep) runs now; point it at real merged-PR history later.
- Baseline (2026-10-05, `openai/gpt-6-luna`): **precision 1.0, recall 1.0, agreement 6/6, 0 false-approves.**
- Clean diffs return `approve` (prompt policy: approve when there are no blockers and no required changes;
  `comment` only for non-blocking observations) — so the unanimous-approve → auto-merge path can fire.

## Import

1. n8n → **Import from File** → the workflow JSON. Import **both** `notify.workflow.json` (channel
   adapters) and a review workflow (`pr-review.workflow.json` or `pr-review-ensemble.workflow.json`).
2. Replace `OWNER/REPO` in the List / Get-diff / Comment / Status HTTP nodes.
3. Create two **Header Auth** credentials and attach them:
   - `GitHub` → header `Authorization: Bearer <token>` (fine-grained PAT: Pull requests read,
     Issues write, **Commit statuses write**).
   - `OpenRouter` → header `Authorization: Bearer <key>`.
   (The JSON references placeholder credential ids; pick the credentials in each node after import.)
4. Confirm the model in the **Prepare request** node matches the `reviewer` entry in
   [`.opencode/models.json`](../../.opencode/models.json).
5. Activate the workflow.

## Caveats (this is a starting point)

- **Dedup exists** — head-sha keyed, so each PR is reviewed once per push.
- **Direct LLM call, not this repository's `pr-reviewer` agent.** The Review node calls OpenRouter
  directly. To use the `pr-reviewer` agent instead, have the node call it headless — same contract.
- **Verify after import.** Confirm the URLs, credentials, and the diff response format in the n8n editor
  before activating.
