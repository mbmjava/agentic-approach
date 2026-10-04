# Reusable templates

Copy these skeletons into the target project and adjust the paths to match its conventions. They are deliberately short: a template that is hard to fill in stops being used. See [Preserve context](preserve-context.md) for when each one is worth writing.

## Living plan

```md
# <Workstream> — living plan

Status: ACTIVE · Owner: <name> · Created: <YYYY-MM-DD>
Scope: <one sentence: what this workstream delivers>

## Current state / next decision
- Latest outcome + evidence relevant to the next step: <result and proof>
- Unresolved decision or blocker: <decision/blocker, or none>
- Next action: <exact next step; do not depend on an optional side document>

## Decisions (locked)
1. <decision> (locked <YYYY-MM-DD>)

## Slices
- [ ] **S1 — <title>** (<commit or state>). <what + why>. **<tests/evidence>.**
- [ ] **S2 — ...**

## Open questions
- <question>

## Update log
- <YYYY-MM-DD> — <what changed and the commit or state>
```

## Handoff

```md
# Handoff — <workstream> (<YYYY-MM-DD>)

Branch: `<branch>` · Working tree: <clean | uncommitted: list>

**State of play (one line):** <the single most important fact right now>

## Read first
1. project instructions and any applicable nested instructions
2. the live plan: <path>
3. this handoff

## Verified green
- <what is actually proven, with the command and result>
- **NOT verified:** <what still needs checking>

## Commits / state
- `<hash>` <one-line> (or: no commits; uncommitted files are ...)

## In progress / running
- <processes, containers, background jobs, and their log locations>

## Next (ordered queue)
1. <next item, with exact commands>
2. <following item>
Stop conditions: <needed decision / scope change / destructive action / failed verification / end of queue>
Continue through the queue; end each turn with the next action or the blocker.

## Gotchas
- <hard-won facts that will bite again>

## Constraints
- <git/environment/prod rules in force>
```

## Decision record

```md
# <NNNN> — <short title>

## Context
<What problem or choice forced a decision, and what constraints applied.>

## Decision
<What was decided, stated so a reader can act on it.>

## Consequences
- Positive: <benefit>
- Accepted cost: <tradeoff or new maintenance burden>
- Follow-ups: <what this decision defers or requires next>
```

## Known-issues register entry

```md
### K<n> — <short title>

- **Status:** open | mitigated | closed
- **Severity:** low | medium | high
- **Owner:** <name>
- **Opened:** <YYYY-MM-DD>
- **Target:** <date or trigger>
- **Impact:** <what breaks or degrades if ignored>
- **Where:** <file, module, or subsystem>
- **Trigger:** <the condition that makes this bite>
- **Next:** <the action to take, or the reason it stays deferred>

Delete a fixed entry; Git history is the record.
```

## Enforcement and cleanup audit

Use this to turn stated rules into checks and to schedule deletion. Fill it in as a read-only assessment first; agree the plan before changing anything. See [Enforcement and cleanup](enforcement-and-cleanup.md) for the ladder and cleanup targets.

```md
# <project> — enforcement & cleanup audit

Type: read-only assessment and proposed plan
Date: <YYYY-MM-DD>
Subject: <repo path> (inspected read-only; no files changed)

## Method and evidence
Inspected (read-only): <instructions, agent definitions, scripts, CI, build files, docs, ignore rules>
Not inspected: <local config, server-side settings such as branch protection>

## Rule -> enforcement map

| Rule (where stated) | Level today | Mechanism / evidence | Gap |
| --- | --- | --- | --- |
| <rule> | <instruction / permission / local check / CI / branch protection / managed> | <file or check> | <gap or none> |

## Findings (prioritized)

### P0 — <a required gate that cannot pass, or an unsafe default>
### P1 — <missing detection or hygiene>
### P2 — <clutter, staleness, no cadence>

## Proposed plan (bounded, risk-ordered)

For each item: the change, the enforcement rung it adds, the exact artifact, and the acceptance check.
1. <change> — rung: <...>; artifact: <path>; accept: <check>
2. ...

## Cleanup cadence
- Slice size: <n items per wave>; targets: <dead code, unused deps, stale docs, scratch>
- Each slice ends green and committed.

## Decisions needed before any edit
- <the real forks the owner must choose>

## Constraints
- The subject repo stays read-only until a scoped change is approved.
```

## Evaluation harness (for non-deterministic behavior)

Use when a feature's output varies between runs (LLM prompts, retrieval, routing, ranking) and you need to judge a change by a number, not a vibe. See [Improve the workflow with evidence](learn-from-evidence.md).

```md
# <feature> — evaluation harness

Question / goal: <what quality means here>
Corpus: <path to a fixed set of cases>  (stable; versioned; not derived from the model)
Ground truth: <how expected outcomes were established — from source data/people, not the model>
Runs per case: <N>  (report pass/N so variance is visible)
Scoring: <exact rules; e.g. expected tools/steps present, required facts in the answer, forbidden content absent>
Boundaries: <live vs hermetic; what infrastructure it needs; hard timeout>
Outputs: <per-case pass/N + overall pass % + enough raw detail to see why a case failed>

## Findings
- <classified failure buckets, not a single overall score>
- <what is measured vs assumed>

## Baseline vs change
- <date/commit, model + config, score> -> <after, score>
- Change one variable at a time.
```

Keep the harness hermetic where possible, and treat it as a deliberate, bounded run—not part of the fast CI suite. Record the model, configuration, and date with every result.

## Review checklist (rubric)

The stable rubric any reviewer (agent or human) applies to a change, so the reviewer is swappable. Pin the output contract too. See [Independent review](independent-review.md).

```text
VERDICT: approve | request-changes | comment
CHECKLIST: <item>=pass|fail|n-a, ...
FINDINGS:
- [blocker|major|minor|nit] path:line — problem; the fix if obvious
```

Checklist items (adapt; keep it short):
- **Correctness & intent** — does what was asked; edge/error paths handled; no smuggled behavior change.
- **Tests & evidence** — focused test for new behavior; regression test for fixes; claims match reality.
- **Docs** — durable docs updated in the same commit; stale copies deleted, not paraphrased.
- **Scope & contracts** — within declared file scope; shared contracts/boundaries respected.
- **Simplicity / anti-slop** — no dead code, unused deps, speculative abstraction, or needless deps.
- **Harness & infra** — changes to instructions, agents, permissions, wrappers, CI flagged for owner review.
- **Boundaries** — no credentials in the diff; no production/shared-environment operations.

## Keep templates honest

- Update the template when the process changes; a stale template teaches the wrong habit.
- Keep one canonical copy per project. Link to the shared standards rather than forking the meaning.
- Do not add a field you never fill in. An empty required field is noise that gets ignored.
