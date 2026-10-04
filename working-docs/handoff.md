---
title: Handoff — initial setup
type: handoff
status: active
owner: mbmjava
last_updated: 2026-10-04
tags: [handoff]
---

# Handoff — initial setup (2026-10-04)

Branch: `main` · Working tree: <clean | uncommitted: list>

**State of play (one line):** <the single most important fact right now>

## Read first

1. `AGENTS.md` → `working-docs/agent-standards.md`
2. the live plan: `working-docs/plans/<name>.md`
3. this handoff

## Verified green

- <what is actually proven, with the evidence (command + result)>
- **NOT verified:** <what still needs checking>

## Commits

- `<hash>` <one-line>

## In progress / running

- <processes, containers, temp state, and where the bodies are buried>

## Next (ordered queue)

1. <next item, with exact commands>
2. <following item>

Stop conditions: needed decision / scope change / destructive action / failed verification / end of queue.
Continue through the queue; end each turn with the next action or the blocker.

## Gotchas

- <hard-won facts that will bite again>

## Constraints

- The orchestrator owns git; workers are read-only for git.
- No secrets in the repo; keep them runtime-only.
