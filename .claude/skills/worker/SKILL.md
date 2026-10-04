---
name: worker
description: Delegate a well-scoped task to a worker subagent — reasoned implementation/critiques/diagnosis, or mechanical edits. Workers may write the exact files they are given and self-verify with bounded builds/tests; git writes and final integration stay with the orchestrator.
---

# Worker delegation

Spawn a **worker subagent** for any task better done as a focused unit than inline: implementation,
code/diff generation, logic critiques, patch/diff reviews, mechanical sweeps, and **diagnosis over
large artifacts** (eval reports, logs).

| Agent | Use for | May run (bounded) |
| --- | --- | --- |
| `worker` | reasoned implementation, new code/tests, critiques, diagnosis→patch | `node scripts/worker-verify.mjs <module> [TestClass]`, `node scripts/check-docs.mjs` |
| `worker-xs` | mechanical edits: renames, imports, front-matter, formatting, links/string substitutions | `node scripts/check-docs.mjs` |

Models are defined once in `.opencode/models.json` (per harness) and synced into the agent files by
`scripts/sync-agent-models.mjs` — never edit a `model:` line by hand.

Both may write the files they are explicitly told to touch. **Git writes, and the final
integration/verification gate, always stay with the orchestrator.**

## 1. Decide what to delegate
Almost anything stateable in a few sentences with concrete context and acceptance criteria.
**Default bias: delegate text/file production and diagnosis; keep judgement.**
- **Implement** a scoped change + its tests (`worker`).
- **Mechanical sweep** — rename/imports/front-matter/links (`worker-xs`).
- **Diagnose a big artifact** — have the worker read `app/target/eval-report.json` (or logs)
  and return **root-cause buckets + a proposed minimal patch**.
- **Critique a diff / review for correctness** (`worker`).

Bad candidates: decision-making, cross-cutting synthesis, final verification, and anything whose
acceptance needs the **live stack beyond the bounded eval wrapper** (`docker`, the app, seeding) — those
are the orchestrator's.

## 2. Scope the assignment
Start from [`ASSIGNMENT.md`](ASSIGNMENT.md). Always:
- Goal + acceptance criteria ("done" looks like …).
- The **exact files it may write** — and nothing else.
- The files to **read first** (or paste the interfaces/records).
- Conventions (hexagonal layout, constructor injection, no new deps, hermetic unit tests).
- **Return format:** a **diff** (or exact old/new) + a **compact summary** — never whole files or raw logs.

Pick **`worker-xs`** when the change is mechanical/unambiguous; **`worker`** when judgement is needed.

## 3. Delegate (background)
Dispatch the subagent **in the background** and continue elsewhere — a foreground worker can hang.
Never pass a `model` expecting it to apply; the model is fixed by the agent file (and `models.json`).

**Serialize the expensive ones:** run **at most one** worker doing a build or the eval at a time
(`target/` and ports are shared). Read-only/mechanical workers can fan out over disjoint files.

## 4. Verify — the orchestrator's gate
- The worker **self-verifies** and returns evidence; **you** verify **scope + integration** (run the
  module build / the eval as the gate), not every line.
- After a pass: `git status --short` and **reject any file outside the named scope** before staging.
- Rework = re-delegate with the critique; each pass is cheap.

## Hard rules
- The worker **never runs git writes** (add/commit/push/merge) — read-only `git status/diff/log` only.
- The worker never exceeds its named file scope; you judge.
- The worker never runs `docker`, the app (`scripts/app-*.mjs`), or a foreground server/`mvn` that does
  not exit; only the bounded commands in the table above.
- Fallback if a worker is unavailable: do the bounded work inline and record why in the handoff.
