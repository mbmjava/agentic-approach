---
title: Agent standards
type: standard
status: active
owner: mbmjava
last_updated: 2026-10-08
tags: [process, agents]
---

# Agent standards

**Living document.** The active standards for how agents work in this repo — session protocol, handoff
approach, orchestration, and worker collaboration. `AGENTS.md` points here; keep this file current and
delete anything that stops earning its place.

## 1. Session protocol

- **Answer before act.** A statement or question is not a work order. Act on an explicit instruction
  ("do it", "fix it"). This governs **new or ambiguous** requests, not already-approved plan items.
- **Operating loop.** Route before implementing (`route: delegate … | inline because …`); delegate
  whenever a bounded slice can be safely delegated (the user is never the trigger); work the ordered
  queue until a stop condition; end every turn with the next action or the blocker.
- **Spec-time authority and wave gate.** Discussion (`vibe`) creates no requirement or approval choice. A
  typed formalizer records the authorized owner's `approval_mode: human | judge` in the canonical spec.
  Starting with waves after this gate is merged to the trusted rollup branch, run
  `node scripts/agentic/preflight.mjs --spec-id <spec_id>` before implementation or worker dispatch and carry
  its result into the handoff. The bootstrap change is human-authorized and reviewed because the trusted gate
  does not exist yet. Do not select or change authority at PR time.
- **One wave per session.** At the first stall or a clean milestone, refresh `working-docs/handoff.md`
  and start a fresh session from it.
- **Bounded wrappers, never foreground long-runners.** A server or build can hang forever; use a wrapper
  with a hard timeout and an announced log path. See [reference wrappers](https://github.com/mbmjava/agentic-approach/blob/main/guide/reference-wrappers.md).
- **Visible narration every turn.** Announce each multi-minute step and its result.
- **Secrets are runtime-only.** Never inline credentials; never commit `.env.local`.
- **Never claim to see an image.** Delegate visual inspection to a bounded capture + review step.

## 2. Handoff approach

**What a wave is.** One coherent unit of work. When it ends — milestone, hour mark, first stall — it hands off.

**Where.** `working-docs/handoff.md` is **one canonical, reusable** handoff, overwritten at each wave
boundary (git is the history), so every session resumes from the same path. A single spec's plan and wave
log live in its `## Plan` and `## Waves` sections; `working-docs/plans/` is for cross-cutting workstreams
spanning multiple specs.

**Template:** start from [`docs/standards/templates/handoff.md`](../docs/standards/templates/handoff.md).
Keep the ordered `Next` queue and the explicit stop conditions.

**Resume cold.** Read the handoff as a snapshot, then the linked approved spec's `## Plan` / `## Waves` or
the cross-cutting plan for current state and next action.
Before acting, do read-only recon to confirm the working tree, processes, and environment still match;
reconcile stale or conflicting notes first. After each meaningful result, update the plan with evidence,
blockers, and the next action before starting another costly or state-changing step.

**Test recovery.** At least once per wave, have a fresh context or read-only reviewer try to resume using
only the handoff and plan. Fix any gaps it finds; chat history is not the recovery mechanism.

## 3. Orchestrator and workers

- The **orchestrator** owns git, integration, and the verification gate. It keeps product judgment and
  cross-cutting decisions with the user.
- A **worker** gets a self-contained brief (goal, acceptance criteria, strict write scope, references,
  out-of-scope boundaries). It returns findings and a diff only, does not message the user, and never
  writes git. See [delegate safely](https://github.com/mbmjava/agentic-approach/blob/main/guide/delegate-safely.md) and the `worker` skill.
- Serialize build/verification work: build output, ports, and caches are shared.

## 4. Verification

- Prefer repository wrappers (`scripts/worker-verify.mjs`) over ad hoc foreground commands.
- Treat a green command as evidence only for what it actually checked.
- Reproduce before you fix; keep the failing test as the regression guard.

## 5. Documentation

Doc layout and lifecycle are in [`docs/standards/documentation.md`](../docs/standards/documentation.md).
Durable knowledge is `docs/`; volatile working state is `working-docs/`. A behavior change updates its doc
in the same commit.
