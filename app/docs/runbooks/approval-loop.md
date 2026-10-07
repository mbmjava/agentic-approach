---
title: Runbook — agentic approval loop
type: runbook
status: active
owner: mbmjava
last_updated: 2026-10-07
tags: [runbook, agents, approval, forge]
---

# Runbook — agentic approval loop

## Purpose

Run the delivery loop that decides **who approves** a change — model by default, human by toggle — and
merges only when the deterministic checks and the adversarial judge agree. The orchestrator runs it; the
scripts in `scripts/agentic/` do the deterministic parts and the subagents (`pr-reviewer`, `judge`) do the
judgement. The **orchestrator** (the agent session) is the single control plane; the decision is the script's.

## Prerequisites

- A pull request whose **base is the rollup branch** (`main`, set as `rollupBranch` in
  `.agentic/config.json`) and whose CI checks have completed.
- `AGENTIC_FORGE_TOKEN` in the environment for live forge calls.
- The change must **not** touch a risk path. Anything under `.opencode/**`, `.claude/**`, `.agentic/**`,
  `scripts/agentic/**`, `AGENTS.md`, `CLAUDE.md`, `docs/standards/**`, `working-docs/agent-standards.md`,
  `**/security/**`, `**/tenancy/**`, `**/db/migration/**`, `**/pom.xml`, `package-lock.json`, or
  `.github/workflows/**` resolves to a **human** approver.

## Steps

1. Confirm the resolved authority for the change (offline, or live with `--pr <n>`):
   `node scripts/agentic/resolve.mjs --files <changed-file>[,<changed-file>…]`
2. Launch `pr-reviewer` on the PR diff → per-item findings + `VERDICT`.
3. Launch `judge` on the diff + the reviewer output + the reported CI status →
   `approve | request-changes | escalate`.
4. Decide without mutating anything (dry run is the default):
   `node scripts/agentic/apply.mjs --pr <n> --judge <verdict> --head-sha <sha>`
5. Merge **only** when the dry run reports `decision.action = "merge"`:
   `node scripts/agentic/apply.mjs --pr <n> --judge <verdict> --head-sha <sha> --allow-merge`

## Verification

- The dry run prints one JSON object: `authority`, `ci`, `judgeVerdict`, `guards`, `decision`, `merged`.
- `merge` is returned only when `authority=model` **and** `ci=pass` **and** `judge=approve`; any other input
  returns `human` or `escalate` — the loop **fails closed**.
- A guard (`base-branch:<ref>` or `head-moved`) forces `escalate`: bind the merge to the judged revision
  with `--head-sha`, so a head that moved after judging is never merged unjudged.

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

The loop's `merge` is an **actuator**, not the gate. Prefer making the provider the gate — branch
protection / required checks that include the judge status — so a change cannot merge without them. The loop
then merges only on `model + ci-pass + judge-approve`; the provider still owns *what is required*.

## Rollback

- Undo a squash merge on the rollup branch with `git revert <squash-commit-sha>` (the loop merges with
  `merge.method = "squash"`).
- To prevent an automated merge before it happens, add the `approve:hold` label — it takes precedence over
  every other rule and forces human approval.
