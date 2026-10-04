# New project bootstrap checklist

A one-page path for standing up agentic coding in a new repository. Skip a step only when you can say why. For an existing project, use [Adopt or refactor](adopt-or-refactor.md) instead.

## 1. Instruction entry point
- [ ] One short project instruction file (`AGENTS.md`, or `CLAUDE.md`/import for Claude Code).
- [ ] Real build, test, and run commands; architecture boundaries; environment limits.
- [ ] A link to the central standards source, not a copy of them.
- [ ] Non-negotiable workflow rules stated plainly (see the [template](agentic-coding-template.md)).
- [ ] **Pick the typed baseline before the first commit.** In a typed ecosystem (for example TypeScript for a React app), standardize on it from day one; converting later means dependency and tooling churn and can leave CI checking a script that does not exist yet (a *phantom gate* — make the check real or delete it).

## 2. One worker, one template
- [ ] A single worker/subagent with a clear scope and a least-privilege tool set.
- [ ] A reusable [assignment template](delegate-safely.md) with goal, acceptance, exact writable files, and report format.
- [ ] Confirm what the worker can actually touch before adding more.

## 3. Bounded commands
- [ ] A fast, hermetic test command the worker can run to self-verify.
- [ ] Bounded wrappers for slow or hanging commands (timeout, cleanup, exit status, unique log). See [Reference wrappers](reference-wrappers.md) for the contracts.
- [ ] Test one failure path deliberately: a timeout or a denied permission.

## 4. Definition of done
- [ ] A project-level DoD: build, focused tests, lint/static-analysis gate, docs updated.
- [ ] A pre-commit quality/anti-slop review, proportional to the change.

## 5. Continuity
- [ ] A living plan location, and one handoff per workstream.
- [ ] [Reusable templates](templates.md) for plan, handoff, decision record, and known issues.

## 6. First pilot
- [ ] One small, real task run end to end: delegate, inspect the diff, verify, commit.
- [ ] Confirm the worker stayed in scope and the checks were trustworthy.
- [ ] Note what was friction; fix the instruction or wrapper before scaling.

## 7. Governance of the harness
- [ ] Harness changes (instructions, agents, skills, permissions, wrappers) are reviewed like code.
- [ ] Pin the model version/variant, tool versions, and standards version you validated against.

## Then stop and review

Do not add a mechanical worker, reviewer, skills, slash commands, or parallel lanes until the pilot shows a recurring need. See [Adopt or refactor](adopt-or-refactor.md) for the staged path and the [LLM prompt](llm-setup-and-refactor.md) to automate the assessment.
