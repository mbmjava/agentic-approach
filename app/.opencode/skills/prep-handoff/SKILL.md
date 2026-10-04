---
name: Prep handoff
description: Prepare the one canonical per-wave handoff. Run before a /clear or at a wave end (milestone reached, ~1 hour in, first stall). Use when the user says "prep the handoff", "prep-handoff", "hand off", "close the wave", or is about to clear context.
---

# Prep handoff

Close the current wave with exactly **one** canonical handoff, then hand the user a prompt to resume.

## 1. Intake — ask for the six things only the user knows
If the user hasn't already supplied them, ask in **one short message** (not a wall of questions):
1. Wave **name + one-line scope**.
2. What **"done"** means.
3. What is explicitly **out of scope**.
4. What **counts as verified** (their acceptance, not just "tests pass").
5. The **ordered next queue** for the next wave (capped; continue until a stop condition).
6. **Constraints** (prod/propose-only, do-not-touch, deadlines, in-flight).

Do not invent these — an unanswered input is recorded as an open question, not a guess.

## 2. Gather the facts yourself (never ask for these)
- `git log --oneline -10`, `git status --short`, current branch.
- What is still running: `docker ps`, background jobs, the app on `:8083`.
- Tests actually run this session, and which claims were verified **live** vs only hermetically.
- Docs to prune/refresh: `node scripts/docs-report.mjs` (aged, orphaned, superseded-but-bodies; report only).

## 3. Write the one canonical handoff
- Follow the shape of `docs/standards/templates/handoff.md`.
- Target the single canonical **`working-docs/handoff.md`** and **overwrite** it for this wave.
- Frontmatter: `title, type: handoff, status, owner, last_updated, tags`.
- Keep it tight — a cold session resumes from it:
  State of play (one line) · Read first · **Verified green** (proven vs **NOT verified**, with
  evidence) · Commits · In progress/running · **Next** (ordered queue + stop conditions) ·
  **Docs to prune/refresh** (≤3) · Gotchas · Constraints.
- Other waves' superseded handoffs: **delete** or leave a one-line `SUPERSEDED BY <path>`.

## 4. Capture decisions
Any hard-to-reverse choice surfaced this wave becomes an **ADR** in `docs/decisions/`
(template `docs/standards/templates/decision.md`). Never leave decisions in handoff prose.

## 5. Verify, then commit
- Run `node scripts/check-docs.mjs` — frontmatter and relative links must be green.
- Commit as part of the wave (the orchestrator owns git).

## 6. Hand the user a resume prompt
End with a ready-to-paste line, e.g.:
`Resume from working-docs/handoff.md — next action: <…>.`

## Rules
- **Refresh, don't accumulate** — never a second handoff per wave.
- **Never paraphrase** an old handoff; replace it.
- **Claims need evidence**; keep *verified* and *NOT verified* separate.
- Relative Markdown links only (no `[[wiki-links]]`).
