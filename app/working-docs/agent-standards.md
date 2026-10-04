---
title: Agent standards
type: standard
status: active
owner: mbmjava
last_updated: 2026-10-04
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
boundary (git is the history), so every session resumes from the same path. The living plan in
`working-docs/plans/` holds the current state needed to resume.

**Template:** start from [`docs/standards/templates/handoff.md`](../docs/standards/templates/handoff.md).
Keep the ordered `Next` queue and the explicit stop conditions.

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
