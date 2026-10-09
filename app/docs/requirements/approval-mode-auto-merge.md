---
title: Spec-time approval and concurrent release candidates
type: requirement
status: draft
owner: mbmjava
last_updated: 2026-10-08
spec_id: AGENTIC-APPROVAL-001
spec_type: enhancement
approval_mode: human # owner-selected for this framework change; draft until remaining open decisions are resolved
tags: [approval, automation, forge]
---

# Spec-time approval and concurrent release candidates — requirements

## 1. Problem statement

The starter has a fail-closed approval decision and a GitHub merge actuator, but the authority choice is
currently resolved from repository defaults, PR labels, and risk-path overrides. The orchestrator launches
the reviewer and judge manually; the judge is not a required CI status. The actuator is configured for one
rollup branch (`main`), and the GitLab forge adapter is a stub. A work wave can therefore begin without an
explicit owner decision about its approval mode. A shared linear `develop` branch also mixes concurrent
release candidates, making them difficult to test and deploy independently. The system cannot yet select
approval at spec time, isolate multiple candidates, or enforce their promotion flow end to end on both forges.

## 2. Goals & non-goals

- **Goal:** Require the authorized spec owner to choose `human` or `judge` while creating the canonical spec;
  carry that fixed choice through preflight, implementation waves, plans, and PR/MRs. Preflight validates the
  earlier decision rather than asking the owner or agent to choose again.
- **Goal:** Keep concurrent release candidates isolated on dedicated branches created from a recorded stable
  `main` revision, rather than combining them on one shared development branch.
- **Goal:** Allow judge-authorized changes to merge automatically only into explicitly configured
  non-main/candidate target branches, after required CI and independent review gates pass.
- **Goal:** Give each active candidate concise resumable state, an immutable tag for each tested candidate
  revision, and an isolated UAT deployment slot.
- **Goal:** When `main` advances, mark affected candidates stale without immediately rebasing or rerunning
  them. Refresh and revalidate a candidate lazily when it next needs a new tag, renewed UAT, or promotion.
- **Goal:** Keep `main` human-controlled and preserve human escalation for holds, protected risk paths, and
  uncertain or unavailable evidence.
- **Goal:** Provide equivalent behavior on GitHub and GitLab through provider adapters and required-check
  configuration.
- **Goal:** Keep the final decision fail-closed, auditable, and bound to the exact reviewed commit and target.
- **Non-goal:** Let the judge choose its own authority, approve its own implementation, or merge to `main`.
- **Non-goal:** Keep an RC independently releasable without changes already accepted into `main`. After a
  refresh, an RC intentionally includes the latest `main` plus its own changes.
- **Non-goal:** Remove human approval from high-risk changes or make every non-main branch eligible for
  automatic merge.
- **Non-goal:** Support an uncalibrated judge as a required gate, or support forges other than GitHub and
  GitLab in this enhancement.

## 3. Scope & interfaces

This is a framework-change initiative with independently verifiable slices: (1) spec authority and wave-start
preflight, (2) isolated RC branches and per-candidate state, (3) GitHub/GitLab CI and approval gates, (4)
immutable RC tagging and isolated UAT deployment, and (5) refresh/revalidation and human promotion to `main`.
Each slice may have its own implementation plan, but all must satisfy this shared contract.

- Add a canonical requirement field, `approval_mode: human | judge`. The spec owner selects it when the
  requirement is created. A wave-start preflight validates the approved spec before implementation or worker
  dispatch begins. Discovery and spec drafting/review may happen before this decision. Missing, malformed,
  or conflicting values block the wave and must not enable judge merging.
- Record the selected mode and spec reference in the active plan/handoff for each implementation wave so the
  decision remains visible across sessions.
- Require each PR/MR to reference its canonical spec by stable `spec_id`. The provider workflow resolves that
  ID against the approved spec on a configured trusted ref, validates `approval_mode`, and exposes the
  validated value as a job output for conditional routing. It must not trust a mode supplied only in PR/MR
  text, labels, or the unreviewed source-branch diff.
- There is no per-wave or PR-time approval-mode toggle. A later mode change requires an authorized, reviewed
  spec amendment; its effect on already-open PRs must be defined and revalidated rather than silently applying
  a new authority.
- Resolve the spec mode together with existing hold labels, risk paths, branch policy, CI state, reviewer
  output, and judge verdict. Existing human overrides remain higher priority than `judge` mode.
- Configure an allowlist of eligible non-main **target** branches. A source branch being non-main is not
  sufficient. The `main` target is always human-controlled.
- Create a distinct RC branch from a recorded `main` SHA for each candidate/release stream. Do not use a
  shared `develop` branch as the isolation boundary for independently tested candidates.
- Use one compact living plan per active RC, following the existing
  [one-plan-per-workstream convention](../../working-docs/plans/README.md). Record the candidate identity,
  spec/mode, branch, base-main SHA, head SHA, current RC tag, CI/judge/UAT state, isolated deployment slot,
  whether refresh is needed, and the next action. Keep
  [`working-docs/handoff.md`](../../working-docs/handoff.md) as the single session/wave handoff; it links to
  active RC plans instead of copying their state. Delete an RC plan when that workstream closes.
- Tag each accepted candidate revision with a unique RC tag that points to its exact tested SHA. Never move
  or overwrite an existing RC tag. Deploy that tagged revision to a slot isolated from other active RCs.
- On a successful candidate promotion to `main`, mark every active RC with an older base-main SHA stale, but
  do not immediately rebase it or launch CI, judge, or deployment work. Staleness detection is event- and
  gate-driven; a continuous polling monitor is not required. Before tagging, resuming UAT, or promoting an RC,
  compare its recorded base-main SHA with current `main` so missed events or external main updates are caught.
- Rebase a stale RC onto the new `main`; after refresh, it contains both the newly accepted changes and its own
  work with a linear candidate history. The orchestrator serializes the rebase and coordinates the dedicated
  RC worker so no edits race with the history rewrite. Re-run required CI and mode-selected approval checks,
  issue a new RC tag, and redeploy before asking for UAT again.
- Keep RC-to-main promotion a distinct, human-authorized step. Judge auto-merge into a candidate branch is
  not permission to merge that candidate to `main`.
- Launch the read-only reviewer and separate adversarial judge automatically for eligible PRs/MRs. Their
  results must be attached to the exact PR/MR head SHA as provider status checks.
- Publish one mode-aware required approval gate on every PR/MR. In `judge` mode it passes only after the
  required CI and judge outcomes pass; in `human` mode it passes only after the configured human approval.
  Skipped conditional jobs must never make this gate pass implicitly.
- Extend the provider-neutral approval actuator in [`../../scripts/agentic/apply.mjs`](../../scripts/agentic/apply.mjs)
  and the GitHub/GitLab adapters to resolve authority, validate CI and target/head guards, and merge only
  when authorized. Provider-native branch protection / protected-branch settings are the authoritative gate;
  the actuator MUST NOT bypass or weaken them.
- `human` mode must not invoke the merge actuator. It routes the change to the human approval path; the
  provider continues to enforce whatever human review rule the repository configures.
- Store judge credentials as protected runtime secrets, use least-privilege forge tokens, and do not expose
  secrets to untrusted fork code.

## 4. Requirements

- **R-1 — Authority selected at spec creation:** The authorized spec owner MUST select exactly one
  `approval_mode` value (`human` or `judge`) while creating the canonical requirement. Every implementation
  wave MUST reference that approved spec and carry its stable spec ID/mode in the active plan/handoff. There is
  no separate approval-mode decision at wave or PR time.
- **R-2 — Wave-start gate:** The orchestrator MUST verify the approved spec and mode before starting
  implementation or dispatching workers for waves begun after the preflight gate is merged to the trusted
  branch. Missing, invalid, conflicting, unavailable, or unverifiable mode metadata MUST block the wave and
  request an owner decision; it MUST NOT silently choose a default. The one-time bootstrap change that adds
  this gate is human-authorized/reviewed because it cannot preflight against code not yet on the trusted ref.
- **R-3 — Fail-closed merge:** Missing, invalid, conflicting, or unverifiable approval-mode metadata MUST
  also disable automatic merge and route to human review or escalation.
- **R-4 — Preserve policy overrides:** A hold, configured risk-path match, `main` target, or explicit human
  authority MUST take precedence over `judge`. The judge MUST NOT override these conditions.
- **R-5 — Non-main target eligibility:** Judge mode MUST be eligible only when the PR/MR target is in the
  configured non-main allowlist. The actuator MUST reject `main`, any unlisted target, and a changed target.
- **R-6 — Independent evidence:** Before an automatic merge, the orchestrator workflow MUST run an
  independent read-only reviewer and a distinct adversarial judge against the current head, acceptance
  criteria, reviewer findings, and reported CI state. Neither role may edit files or merge.
- **R-7 — Required provider checks:** CI and judge outcomes MUST be published as provider-recognized status
  checks for the reviewed head and configured as required checks / pipeline gates. A pending, missing, stale,
  failed, or unexpectedly skipped required check MUST block automatic merge. Provider-specific status mapping
  MUST be explicit rather than assuming GitHub and GitLab represent skipped or neutral outcomes identically.
- **R-8 — Human mode:** When `approval_mode` resolves to `human`, the automation MUST NOT merge, even if CI
  passes and the judge approves. It MUST expose the human-required outcome and route to the configured human
  review process.
- **R-9 — Safe automatic merge:** For `judge` mode, the actuator MAY merge only when authority resolves to
  judge, the target is eligible and non-main, all required CI checks pass, the judge approves, and the live
  PR/MR head SHA and target still match the evaluated values.
- **R-10 — Provider parity:** GitHub and GitLab MUST implement the same authority, evidence, and decision
  contract. Provider differences MUST remain within adapters and workflow configuration.
- **R-11 — Calibration gate:** Judge-required auto-merge MUST remain disabled until the judge has been
  calibrated on correctly labeled real PR/MR heads and meets the repository's configured false-approval
  threshold. The initial threshold MUST be zero false approvals on the calibration corpus.
- **R-12 — Bypass and recovery:** The repository MUST restrict bypass of required checks. A deliberate
  break-glass human override MUST be distinguishable from an ordinary judge merge and recorded. Provider,
  model, or network errors MUST fail closed without partial merge actions.
- **R-13 — Auditability:** Each decision MUST record the spec ID and mode, resolved authority and overrides,
  target branch, evaluated head SHA, CI result, reviewer/judge verdicts, decision, and merge result without
  storing secrets or private model reasoning.
- **R-14 — Trusted mode resolution:** Each PR/MR MUST identify its canonical spec by stable `spec_id`. The
  provider workflow MUST resolve and validate `approval_mode` from that approved spec on a configured trusted
  ref, not from PR/MR text, labels, or an unreviewed source-branch edit. Unknown, missing, or unapproved spec
  data MUST fail closed.
- **R-15 — Mode-aware required gate:** GitHub Actions and GitLab CI MUST publish a required approval-gate
  result for every PR/MR. Judge mode passes only after its required CI and judge checks pass; human mode passes
  only after its configured human-approval condition is met. A skipped or absent conditional job MUST NOT
  count as approval.
- **R-16 — Candidate isolation:** Each active RC MUST have a unique candidate identity and a dedicated branch
  created from a recorded stable `main` SHA. Changes for distinct active RCs MUST NOT be merged into a shared
  integration branch before candidate-specific testing and UAT.
- **R-17 — Candidate provenance:** The RC plan MUST record the candidate ID/version, linked spec and approval
  mode, candidate branch, base-main SHA, current head SHA, latest checks, RC tag, deployment slot, UAT state,
  stale/refresh status, and next action. A candidate plan MUST be the resumable micro-handoff for that RC.
- **R-18 — Session handoff boundary:** The canonical `working-docs/handoff.md` MUST remain the session/wave
  handoff and link to each active RC plan. It MUST NOT be copied or independently edited as one competing
  handoff per RC. The orchestrator owns shared state updates and prevents overlapping writes.
- **R-19 — Immutable candidate tags:** The orchestrator MUST create a new, unique RC tag only after the exact
  candidate head passes its required checks and spec-selected approval gate. Each tag MUST point to the tested
  SHA, MUST NOT be moved or overwritten, and MUST identify the candidate/revision well enough to select its
  deployment.
- **R-20 — Isolated UAT:** Each active RC tag MUST deploy to a candidate-specific test slot so deploying or
  testing one RC cannot replace another RC's running candidate. UAT results MUST identify the RC tag and SHA.
- **R-21 — Refresh after main promotion:** When a candidate is merged to `main`, every other active RC whose
  base-main SHA is older MUST be marked stale. Reconciliation MUST be triggered by the promotion event; a
  continuous polling monitor is not required. Before tagging, resuming UAT, or promotion, the system MUST also
  compare the RC's base-main SHA with current `main`, catching missed events and external updates. A stale RC
  MUST be rebased onto the new `main` before further UAT or promotion. Its refreshed state intentionally
  contains the new `main` changes plus its own changes, with no merge commit added solely to refresh it.
- **R-22 — Revalidate and version after refresh:** A refreshed RC MUST receive new CI and mode-selected
  approval evidence for its new head SHA, a new immutable RC tag, and a redeployment before UAT resumes. Prior
  checks, judge verdicts, UAT results, and tags MUST NOT be reused as evidence for the refreshed SHA.
- **R-23 — Human promotion to main:** Promotion of a candidate to `main` MUST require the configured human
  authorization and provider gate, regardless of the candidate's judge-mode approval for its non-main branch.
- **R-24 — Conflict handling:** A refresh conflict or semantic incompatibility MUST stop automatic promotion
  and return the candidate to the orchestrator/owner for resolution. After resolution, the complete refresh
  verification sequence MUST run again.
- **R-25 — Serialized main promotion:** Candidate promotions to `main` MUST be serialized against the current
  main head. After one promotion succeeds, the system MUST re-evaluate every other active candidate against
  the new main SHA before permitting another promotion.
- **R-26 — Candidate cleanup:** When an RC workstream closes, its temporary branch and per-RC plan MUST be
  retired according to the configured retention policy. Immutable tags and audit evidence for deployed or
  released candidates MUST remain available.
- **R-27 — Rebase ownership:** The orchestrator MUST own and serialize each RC rebase. The dedicated worker
  MUST pause or refresh its workspace to the rewritten head before resuming; no concurrent writes may race
  with the rebase. Updating an already-published branch MUST be conditional on its expected old head (for
  example, a lease-protected force update) and MUST fail if the ref moved. The operation MUST record the old
  and new base/head SHAs.
- **R-28 — Native gate authority:** GitHub branch protection/rulesets and GitLab protected-branch/merge
  controls MUST enforce the configured required checks and approval policy. `apply.mjs` MAY validate the
  decision and request a merge, but MUST NOT bypass, weaken, or substitute for those native controls. Tests
  MUST verify provider-specific status mapping and that missing, skipped, or failed required checks block.
- **R-29 — Supersede stale evaluations:** CI/reviewer/judge work MUST use provider-native concurrency controls
  scoped to one PR/MR and RC, stable across head updates and distinct across RCs. A new head MUST cancel or
  supersede in-flight evaluations of the older head without cancelling unrelated RCs or an active rebase,
  promotion, or merge mutation. A cancelled or stale run MUST NOT publish a passing required gate.
- **R-30 — Verify the evaluated head:** Every check and reviewer/judge verdict MUST identify its evaluated
  head SHA. Before publishing approval and again before merge, the workflow MUST compare that SHA to the
  current PR/MR head and ignore stale results. Cancellation is resource control, not a substitute for this
  correctness guard.
- **R-31 — Bind the verdict to the spec revision:** The orchestrator MUST record the trusted spec commit SHA
  used to brief the reviewer/judge and require the same SHA when applying the verdict. A missing, unavailable,
  or changed spec SHA MUST block automated merge and require fresh evaluation.

## 5. Edge cases & boundaries

- A PR/MR targets `main` while its spec says `judge`: keep it on the human path; do not auto-merge.
- An implementation wave is about to start without an approved requirement or explicit mode: block the
  wave; do not infer `human` or `judge` from defaults, labels, or prior sessions.
- A spec mode needs to change after creation: require an owner-authorized, reviewed amendment and explicit
  revalidation of affected waves/PRs; never silently apply the new mode to in-flight work.
- A PR/MR edits the mode in its own unreviewed diff, supplies an unknown spec ID, or references a spec version
  that differs from the approved trusted version: do not use that value; block the gate and request
  owner-authorized resolution.
- A spec selects `human` but the judge says `approve`: do not auto-merge.
- A risk path or hold appears after spec approval: resolve to human and require fresh review as configured.
- The PR/MR head changes after CI or judgment: invalidate stale evidence and rerun; never merge the new head
  using a verdict for the old SHA.
- A new PR/MR head arrives while a reviewer or judge is running: cancel/supersede that candidate's older
  evaluation. If cancellation is late or unsupported, reject its verdict by the SHA guard; unrelated RC
  evaluations continue.
- Two RCs begin from the same `main` SHA and one is accepted first: mark the other stale once `main` advances;
  do not present its old tag or evidence as current.
- A main update event is missed or main advances outside the RC orchestrator: the gate-time SHA comparison
  still marks affected candidates stale and blocks their next tag, UAT, or promotion.
- A main promotion makes several RCs stale at once: update stale state only; do not immediately fan out
  rebases, CI/judge runs, or deployments. Refresh each candidate only when it next needs UAT, a new tag, or
  promotion.
- Refreshing an RC after another candidate reaches `main` makes it cumulative: its new candidate contains
  both the latest `main` and its own changes, and must be retested as that combined state.
- A refresh has conflicts, fails CI/judge, or cannot update its isolated deployment slot: stop that RC's UAT
  and promotion until resolved; do not disturb other candidates' slots.
- A rebase rewrites the RC commit SHAs: invalidate all checks, reviews, UAT results, and deployment claims
  tied to the previous head; require the worker to resume from the new head.
- An RC tag already exists for a candidate revision: never retag it after refresh; create a new tag for the
  new SHA.
- Multiple specs with conflicting modes, or a PR/MR without a traceable spec: fail closed to human/escalation.
- CI is pending, skipped contrary to policy, failed, or cannot be read; reviewer/judge times out or returns an
  invalid verdict; provider API is unavailable; or the target branch is not allowlisted: do not merge.
- Duplicate workflow events or retries MUST be idempotent and MUST NOT merge a different revision.
- Fork-originated changes MUST NOT receive forge or model secrets in an untrusted code-execution context.
- **Risks & mitigations:** False approval, stale checks, prompt injection, and over-broad tokens could ship an
  unsafe change. Mitigate with separate read-only reviewer/judge roles, least-privilege credentials, exact-SHA
  binding, required provider checks, judge calibration, auditable decisions, and a human hold path.
- **Blast radius:** The feature affects spec metadata, agent orchestration, CI/workflow permissions, approval
  policy, and merge operations for configured non-main branches in adopting repositories. Changes to the
  approval loop or its CI/workflow remain human-gated risk paths.
- **Dependencies / readiness:** Implement and test the GitLab REST adapter (currently a stub), add automatic
  judge orchestration and status reporting for both providers, configure protected branches/rulesets, define
  the non-main target allowlist, and provision protected runtime credentials. See the
  [approval-loop runbook](../runbooks/approval-loop.md) and
  [spec review checklist](../standards/spec-review-checklist.md).
- **Open decisions before implementation:** Which non-main target branches are eligible (for example, only
  selected RC branches), and how per-RC plan files
  are kept out of delivered artifacts and cleaned up when a candidate closes.

## 6. Acceptance

- [ ] A spec can record `approval_mode: human` or `approval_mode: judge`, identify its authorized owner, and
  link that choice to the resulting PR/MR.
- [ ] The approval-mode question is answered during spec creation and cannot be substituted by a per-wave
  prompt, PR label, or PR text.
- [ ] Attempting to start an implementation wave without an approved spec and explicit valid mode is blocked
  before implementation or worker dispatch; discovery/spec drafting remains available.
- [ ] The bootstrap implementation is human-authorized; preflight enforcement applies to subsequent waves only
  after the gate and an approved spec are present on the trusted ref.
- [ ] The active plan/handoff records the spec ID and mode, and a mode amendment is revalidated before the
  next wave.
- [ ] A PR/MR referencing an approved spec resolves its mode from the configured trusted ref; a mode found
  only in PR/MR text, labels, or an unreviewed diff is rejected.
- [ ] A mode-aware required approval gate is reported for every PR/MR: judge mode requires CI and judge
  approval; human mode requires human approval; skipped or missing jobs cannot pass it.
- [ ] Missing, invalid, conflicting, or changed-without-authorization mode metadata never enables automatic
  merge.
- [ ] A judge-mode PR/MR targeting an allowlisted non-main branch launches CI, reviewer, and judge checks;
  all required statuses identify the same head SHA.
- [ ] A judge-mode PR/MR merges automatically only with passing CI, an approving judge, unchanged head and
  target, valid authority, and provider checks satisfied.
- [ ] A PR/MR targeting `main`, using human mode, touching a human-only risk path, or carrying a hold cannot
  be auto-merged by the judge path.
- [ ] Failed, pending, missing, stale, malformed, or unavailable evidence blocks merge and produces a
  visible human/escalation outcome.
- [ ] GitHub and GitLab pass equivalent adapter/workflow tests for eligible merge, human route, risk override,
  main-target denial, head movement, CI failure, missing verdict, API failure, and retries.
- [ ] Branch protection / protected-branch configuration requires CI and judge statuses and limits bypass;
  any break-glass merge is logged separately.
- [ ] Provider-specific tests confirm the native forge gate blocks missing, skipped, stale, or failed
  required checks; the actuator cannot bypass that gate.
- [ ] Judge auto-merge cannot be enabled before the real-case calibration gate is satisfied.
- [ ] Audit output contains the required decision evidence and no secrets or private model reasoning.
- [ ] Two RCs can be created from the same recorded `main` SHA, advanced, tested, and deployed without
  changing each other's branches, tags, or test slots.
- [ ] Each active RC has one resumable plan containing the required candidate identity, SHA, gate, UAT, and
  next-action state; the session handoff links to those plans without duplicating them.
- [ ] A passing RC revision receives a unique immutable tag pointing to its exact tested SHA and deploys to
  its own isolated slot; another RC can remain deployed simultaneously.
- [ ] After one RC merges to `main`, other stale RCs are identified, refreshed to the new `main`, and forced
  through CI, their mode-selected approval gate, a new tag, and redeployment before UAT resumes.
- [ ] A successful main promotion triggers stale-candidate reconciliation, while a gate-time SHA comparison
  catches missed/external updates; a promotion marks RCs stale without immediately launching rebases, CI, judge
  work, or deployments, and no continuous main-polling service is required.
- [ ] Refresh rebases the RC onto the new `main` without a merge commit, is serialized by the orchestrator,
  and resumes the dedicated worker from the rewritten head.
- [ ] If the RC remote ref changes during refresh, the conditional branch update is rejected rather than
  overwriting the concurrent update.
- [ ] A new head cancels or supersedes in-flight CI/reviewer/judge evaluation for that same PR/MR/RC without
  cancelling unrelated candidates or mutating operations; stale completion cannot publish a passing gate.
- [ ] Every reported result is tied to its evaluated SHA, and a late result for a superseded SHA is rejected
  both before gate publication and before merge.
- [ ] The refreshed RC contains the new `main` changes plus its own changes; any conflict blocks automation
  until resolved and reverified.
- [ ] Human UAT and configured human authorization are required before any RC is promoted to `main`.
- [ ] Competing RC promotions to `main` are serialized; a successful promotion makes other candidates stale
  until refreshed and revalidated.
- [ ] Closing an RC retires its temporary branch and plan without deleting its immutable release tags or audit
  evidence.
