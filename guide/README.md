# Guide index

The playbook is a set of short topics. Start with [What this is](what-this-is.md), then follow the reading
path in the [playbook](playbook.md). This page is the full topic index.

![Agentic coding flow from idea to merge: the user and orchestrator frame work, bounded workers return diffs, local checks run, and the PR fans out to CI and a read-only reviewer. A separate judge feeds a policy-based, fail-closed merge decision; failures loop back to implementation.](coding-flow.svg)

[Open or download the standalone SVG](coding-flow.svg).

## Orientation

- [What this is](what-this-is.md) — purpose, source, and how to use the guide.
- [Playbook](playbook.md) — the reading path, central idea, principles, and change log.
- [Agentic-coding template](agentic-coding-template.md) — pick the lightest workflow that fits.
- [Spec authoring and wave gates](spec-authoring-and-wave-gates.md) — separate discussion, spec-time authority, and implementation preflight.
- [Token economics](token-economics.md) — estimate cost before you spend it.
- [Anti-patterns](anti-patterns.md) — failure modes to avoid.

## Roles and delegation

- [Orchestrator and worker roles](agentic-workflow.md) — how work is split.
- [Delegate safely](delegate-safely.md) — when parallel work earns its coordination cost.
- [Independent review](independent-review.md) — a swappable reviewer behind a stable contract.
- [Approval authority](approval-authority.md) — who may approve a change: a forge-neutral policy plus a fail-closed decision.

## Environment and continuity

- [Productive environment](productive-environment.md) — bounded and observable, without ceremony.
- [Preserve context](preserve-context.md) — survive session boundaries; handoff and plans.
- [Reusable templates](templates.md) — plan, handoff, decision, requirement, runbook.
- [Reference wrappers](reference-wrappers.md) — bound slow or hanging commands.

## Improvement from evidence

- [Learn from evidence](learn-from-evidence.md) — turn outcomes into durable practice.
- [Adopt or refactor](adopt-or-refactor.md) — bring an existing setup up to standard.
- [Documentation bloat](documentation-bloat.md) — keep docs earning their place.
- [Enforcement and cleanup](enforcement-and-cleanup.md) — make rules stick.

## Adapters and adoption

- [OpenCode setup](configure-opencode.md) — the OpenCode adapter.
- [Claude Code setup](claude-code-setup.md) — the Claude Code adapter.
- [Portable agent config](portable-agent-config.md) — one model source for both CLIs.
- [GitLab adapter](gitlab-adapter.md) — provider portability for review.
- [Working agreement](working-agreement.md) — the living agreement pattern.
- [Bootstrap checklist](bootstrap-checklist.md) — start a new project.
- [Bring the playbook into a project](bring-playbook-to-project.md) — reference, copy, install.
- [Use an LLM to set up or refactor](llm-setup-and-refactor.md) — assessment and implementation prompts.
