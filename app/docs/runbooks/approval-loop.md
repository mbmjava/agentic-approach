---
title: Runbook — agentic approval loop
type: runbook
status: active
owner: mbmjava
last_updated: 2026-10-08
tags: [runbook, agents, approval, forge]
---

# Runbook — agentic approval loop

## Purpose

Run the delivery loop that resolves **who approves** from the canonical requirement's
`approval_mode: human | judge`. `judge` maps to model authority; `human` never invokes the merge actuator.
The orchestrator runs it; scripts in `scripts/agentic/` perform deterministic checks and the read-only
`pr-reviewer` / `judge` agents supply separate findings and verdicts. The judge is manually launched by the
orchestrator; the current starter CI does not launch it or publish a judge status check.

## Prerequisites

- Run wave preflight before implementation or worker dispatch:
  `node scripts/agentic/preflight.mjs --spec-id <spec_id>`. Carry its approved spec ID and mode in the active
  plan/handoff. Discussion/spec authoring can happen first; preflight validates the choice made at spec
  creation and does not ask for a new per-wave toggle.
- The initial bootstrap change that introduces trusted-spec preflight is human-authorized and reviewed; it
  cannot use the preflight before that code and its approved spec exist on trusted `main`.
- For live PR resolution, use a **clean, synchronized checkout of the trusted rollup branch** (`main`, set as
  `rollupBranch` in `.agentic/config.json`), never the PR source branch.
- A PR whose description contains exactly one `Spec ID: <spec_id>` reference to an approved requirement on
  trusted `main`, and whose CI checks have completed. `main` is human-only; judge mode is eligible only for a
  non-main target matched by `judgeMergeTargets` (empty by default; configure deliberately for the repository).
- `AGENTIC_FORGE_TOKEN` in the environment for live forge calls.
- The change must **not** touch a risk path. Anything under `.opencode/**`, `.claude/**`, `.agentic/**`,
  `scripts/agentic/**`, `AGENTS.md`, `CLAUDE.md`, `docs/standards/**`, `working-docs/agent-standards.md`,
  `**/security/**`, `**/tenancy/**`, `**/db/migration/**`, `**/pom.xml`, `package-lock.json`, or
  `.github/workflows/**` resolves to a **human** approver.

## Steps

1. Resolve the trusted spec authority (offline by ID, or live from the PR's `Spec ID` line). Record the
   returned `trustedSha` as the spec revision under review:
   `node scripts/agentic/resolve.mjs --spec-id <spec_id>` or
   `node scripts/agentic/resolve.mjs --pr <n>`.
2. Launch `pr-reviewer` on the PR diff → per-item findings + `VERDICT`.
3. Launch `judge` on the diff + canonical spec ID/mode + reviewer output + reported CI status →
   `approve | request-changes | escalate`. The mode is context, not something the judge may change; `human`
   mode is never made mergeable by an approving verdict.
4. Decide without mutating anything (dry run is the default), binding both the evaluated PR head and trusted
   spec revision:
   `node scripts/agentic/apply.mjs --pr <n> --judge <verdict> --head-sha <sha> --spec-sha <trustedSha>`
5. Merge **only** when the dry run reports `decision.action = "merge"`:
   `node scripts/agentic/apply.mjs --pr <n> --judge <verdict> --head-sha <sha> --spec-sha <trustedSha> --allow-merge`

## Verification

- The dry run prints one JSON object: trusted `spec` identity/mode/ref/SHA, `authority`, `ci`, `judgeVerdict`,
  `guards`, `decision`, and `merged`.
- `merge` is returned only when `authority=model` **and** `ci=pass` **and** `judge=approve`; any other input
  returns `human` or `escalate` — the loop **fails closed**.
- A human-mode spec, main target, hold, or configured risk-path match cannot be upgraded by a judge verdict or
  approval label. Missing/untrusted spec metadata resolves to human/escalate.
- A guard for a missing/changed spec revision, head SHA, or target forces `escalate`. The actuator re-reads
  the PR immediately before merge to detect a head or target change since evaluation; provider-native rules
  remain the ultimate protection against changes outside that read/merge window.

## Calibrate before you require it

The judge is advisory until it has been measured on **real, correctly-labelled PR heads**:

1. Fill `scripts/agentic/corpus/` with real cases (`id`, `repo`, `pr`, `head`, `authority`, `expected`,
   `note`). Label `expected` with the verdict the review record actually required **at that head**; set
   `authority` from `resolve.mjs`.
2. Run `pr-reviewer` then `judge` on each head and record the verdicts as `{ id, authority, expected, got }`.
3. Score: `node scripts/agentic/calibration.mjs --results <file>`. The headline metric is
   **`falseApproveRate`** (approving a change that should not merge). **Score only `authority=model`
   cases** — for human-gated changes the loop never consults the judge.
4. Widen automation only when `falseApproveRate = 0` on that real corpus. A small synthetic corpus can read
   perfectly and miss real defects; do not treat it as proof.

## Provider gate vs loop decision

The loop's `merge` is an **actuator**, not the gate. Provider branch protection / protected-branch rules are
the actual gate. **Current starter limitation:** its provider setup requires CI checks, but no CI workflow
launches the judge or publishes a judge status. Therefore `apply.mjs` can merge only when the orchestrator
uses it with an approving verdict, but a person with merge access can still use the provider UI after CI
passes without waiting for the judge. Do not describe judge approval as provider-enforced until a required
judge status is wired and bypass is restricted. The GitLab adapter is currently a stub.

## Rollback

- Undo a squash merge on the rollup branch with `git revert <squash-commit-sha>` (the loop merges with
  `merge.method = "squash"`).
- To prevent an automated merge before it happens, add the `approve:hold` label — it takes precedence over
  every other rule and forces human approval.
