# Project — agent instructions

A harness-ready Maven + React starter: the agent workflow, checks, and CI are already wired. Replace
the sample `GreetingController` and the frontend page with your domain.

This file is the short entry an agent loads every session. The living policy is in
[`WORKING-AGREEMENT.md`](WORKING-AGREEMENT.md); the agent working standards are in
[`working-docs/agent-standards.md`](working-docs/agent-standards.md). The playbook this starter comes
from is a separate reference:
<https://github.com/mbmjava/agentic-approach/tree/main/guide>.

## Read first

1. [`working-docs/agent-standards.md`](working-docs/agent-standards.md) — how agents work here.
2. [`docs/standards/documentation.md`](docs/standards/documentation.md) — doc layout and lifecycle.
3. [`working-docs/handoff.md`](working-docs/handoff.md) — current state (starts as a template).

## Operating loop

- **Route before you implement.** Before substantial work, state
  `route: delegate ⟨slice⟩ | inline because ⟨reason⟩`.
- **Delegate whenever a bounded slice can be safely delegated.** The user is never the trigger; do not
  wait to be reminded. Keep product judgment and integration with the orchestrator.
- **Work an ordered queue** (the `Next` list in the handoff/plan) and continue until a stop condition:
  a needed decision; a scope change; a destructive action; a failed verification; or the end of the queue.
  End each turn with the next action or the blocker.
- **Answer before act** for new or ambiguous requests — but an approved plan item is executed, not
  re-questioned.
- **Visible narration every turn.** Announce multi-minute steps and their result; no silent tool-only turns.
- **One wave per session.** At the first stall or a clean milestone, refresh
  [`working-docs/handoff.md`](working-docs/handoff.md) and start fresh from it.

## Non-negotiables

- **Harness is code.** Instructions, agents, skills, permissions, scripts, and CI get the same review as code.
- **One canonical home per subject.** Link instead of copying; delete or supersede stale text.
- **Tool-neutral core, adapters per CLI.** Shared guidance stays CLI-independent; OpenCode and Claude
  specifics live in `.opencode/` and `.claude/`.
- **No secrets.** Examples only; `.env.example`, never `.env.local`.
- **Fail loud; reproduce before you fix; bound the loop.**
- **Workers return findings only.** They work from the brief, do not message the user, and never write git.

## Layout

| Path | What it is |
| --- | --- |
| `src/`, `pom.xml` | the Spring Boot API |
| `frontend/` | the Vite + React app |
| `.opencode/`, `.claude/`, `CLAUDE.md` | the agent harness for both CLIs |
| `scripts/` | verification and hygiene wrappers |
| `docs/` | standards, templates, known issues |
| `working-docs/` | agent standards, handoff, plans, wave log |
| `tools/` | the PR-review flow (provider gate + n8n advisor) |
| `.github/` | CI, PR template, CODEOWNERS |

## Verify

- Docs and links: `node scripts/check-docs.mjs`
- Harness consistency: `node scripts/check-harness-parity.mjs` and `node scripts/sync-agent-models.mjs --check`
- Backend: `node scripts/worker-verify.mjs` (or `./mvnw test`)
- Frontend: `cd frontend && npm ci && npm run lint && npm run test && npm run build`

## Git and delegation

- The orchestrator owns git. Workers are read-only for git (`status`/`diff`/`log`).
- Keep changes small and reviewable; one item at a time, each verified green before the next.
