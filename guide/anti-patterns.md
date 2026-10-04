# Anti-patterns

These are failure modes that look productive and quietly cost correctness, tokens, or trust. Each links to the practice that counters it.

## Correctness and failure

- **Masked failure.** Reporting “no results,” “skipped,” or a canned answer when a step actually errored. Surface the failure; treat a failed query as failed, not empty. See [fail loud](agentic-coding-template.md).
- **Retry loop hiding a root cause.** Bounded validate-then-repair is fine; automatic retries that paper over a real bug are not. Fix the cause and bound the attempts.
- **Fix without a reproduction.** Changing behavior before you can demonstrate the failing case. Require a failing test or minimal repro first, and keep it as the regression guard.
- **Claimed verification.** Calling work “verified” because a process exited or a log printed a marker. Use the exit status and the specific check; report what was not verified.
- **Agent-edited harness.** An agent silently changing its own instructions, agents, permissions, or wrappers to get unblocked. The harness is code under change control; agents propose, humans review.

## Autonomy and control

- **Unbounded autonomy.** An agent with no step, turn, or time budget that spins or wanders. Bound the loop and require a stop-and-report.
- **Prompt as sandbox.** Treating a file list or a rule in a prompt as enforced isolation. Prompts guide; permissions, worktrees, and approvals constrain.
- **Silent scope creep.** A worker editing outside its assignment “helpfully.” Reject out-of-scope changes even when they look like improvements.
- **Parallel writers on shared files.** Two agents editing the same file, schema, or contract. Keep one owner and serialize overlapping work.

## Context and cost

- **Dumping raw context into the orchestrator.** Pasting whole logs, files, or transcripts into the expensive session. Have workers return findings, paths, and a diff.
- **Long-lived mega-session.** Keeping one session running for days and re-deriving state each turn. Prefer a fresh session with a plan and handoff.
- **Duplicated investigation.** Several workers researching the same question. Assign disjoint questions and share the result.
- **Mega-agent / mega-skill.** One role or skill doing everything. Split by responsibility, not by name.

## Process

- **Stale or competing guidance.** Two docs (or two instruction files) that disagree. Delete or supersede; keep one canonical copy. See [Prevent documentation bloat](documentation-bloat.md).
- **Ceremony on small work.** Full plan, delegation, and handoff for a one-line fix. Match process to size and risk.
- **Guide drift.** The playbook and the project rules diverging until neither is trusted. Update the guide as you learn, and record the change.
- **Documentation sprawl.** Adding a new page for every session instead of editing the canonical one. Delete more than you add.
- **Enforcement theater.** A rule written as mandatory with no permission, check, or required CI gate behind it. See [Enforcement and cleanup](enforcement-and-cleanup.md).

## What good looks like

Bounded, observable work with a clear owner; failures surfaced, not hidden; harness changes reviewed like code; context kept small; and process proportional to risk. See [Orchestrator and worker roles](agentic-workflow.md) and [Delegate safely](delegate-safely.md).
