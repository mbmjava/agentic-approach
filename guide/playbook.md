# Agentic coding playbook

Build a productive, economical, collaborative, and enjoyable agentic-coding workflow. Treat the user and orchestrator as partners: the user brings intent, taste, and domain judgment; the orchestrator translates that into decisions and steers the work. Offload bounded research, implementation, and other legwork to economical workers whenever quality can be maintained. Keep the user's and orchestrator's judgment out of the worker lane. Informally, this is controlled cowboy mode: move fast, but keep the reins and the guardrails.

For what this document is, where it comes from, and how to use it, see [What this is](what-this-is.md).

## Start with the workflow

1. Start with the [agentic-coding template](agentic-coding-template.md) and pick the lightest workflow that fits.
2. Learn the [orchestrator and worker roles](agentic-workflow.md) and how work is split.
3. Estimate [token use and cost](token-economics.md) for the work ahead.
4. Choose [OpenCode](configure-opencode.md) or [Claude Code](claude-code-setup.md); keep shared guidance independent of the CLI where possible.
5. [Delegate and verify](delegate-safely.md) when parallel work earns its coordination cost.
6. Make the [environment bounded and observable](productive-environment.md) without adding ceremony to safe everyday work.
7. [Preserve context](preserve-context.md) when work spans sessions, using the [reusable templates](templates.md).
8. [Improve from evidence](learn-from-evidence.md), then [adopt or refactor](adopt-or-refactor.md) a complete setup—or follow the [bootstrap checklist](bootstrap-checklist.md) for a new project.
9. Use an [LLM setup or refactor prompt](llm-setup-and-refactor.md) to apply the guide to another project, following [how to bring the playbook into a project](bring-playbook-to-project.md).
10. Avoid the known [anti-patterns](anti-patterns.md), and [keep the docs from bloating](documentation-bloat.md).

## How to read this guide

- **New to agentic coding:** read the [template](agentic-coding-template.md), then [roles](agentic-workflow.md), then [safe delegation](delegate-safely.md).
- **Setting up a project:** the [bootstrap checklist](bootstrap-checklist.md), the [working agreement](working-agreement.md), and the [template](agentic-coding-template.md), plus the [OpenCode](configure-opencode.md) or [Claude Code](claude-code-setup.md) adapter.
- **Improving an existing setup:** [adopt or refactor](adopt-or-refactor.md), then the [LLM prompts](llm-setup-and-refactor.md).
- **Making rules stick or keeping the repo clean:** [enforcement and cleanup](enforcement-and-cleanup.md).
- **Long-running or risky work:** [productive environment](productive-environment.md), [reference wrappers](reference-wrappers.md), and [context continuity](preserve-context.md).
- **Optimizing cost:** [token economics](token-economics.md).
- **Checking your instincts:** [anti-patterns](anti-patterns.md).

## The central idea

Keep one primary agent as the orchestrator and accountable owner of every task. The user collaborates with that agent to shape the result; it can work directly for a small change or dispatch focused workers when that improves throughput, quality, or user experience. Delegation does not transfer product judgment or responsibility for integration.

Keep the loop small and visible:

> Orient → frame the task → delegate or implement → inspect the result → verify → record the state needed to continue.

The role, collaboration, cost, verification, and recovery principles are tool-neutral. Configuration examples are split into CLI-specific adapters because OpenCode and Claude Code use different agent, permission, and skill formats. Check the linked product documentation before copying an adapter into a live project.

## Principles to keep

- Prefer a clear single owner over loosely coordinated parallel agents.
- Parallelize only work that has disjoint write scopes and independent verification.
- Automate repetitive workflow steps, but keep consequential decisions and acceptance human-steerable.
- Persist decisions and rationale when they affect future work; do not try to preserve every token of a conversation.
- Treat a successful command as evidence only for what that command actually checked.
- **Fail loud.** Surface errors; never mask a failure as an empty result, a skip, or a canned answer. Bound retries and fix the root cause.
- **Reproduce before you fix.** Require a failing test or minimal repro first, and keep it as the regression guard.
- **Treat the agent harness as code.** Instructions, agents, skills, permissions, and wrappers are reviewed and version-controlled; an agent may propose changes to them but must not silently relax its own controls.
- **Bound the loop.** Give agents step/turn/time budgets and explicit stop conditions so they stop and report rather than spin.

## Change log

- This playbook evolves as the practice does. Record meaningful changes here so readers can trust the current version.

- 2026-10-01 — Initial playbook: roles, delegation-first, token/cost, continuity, evidence, adopt/refactor, LLM prompts, OpenCode and Claude Code adapters.
- 2026-10-01 — Added anti-patterns, a new-project bootstrap checklist, reusable templates, and the fail-loud / reproduce-before-fix / harness-as-code / bound-the-loop principles.
- 2026-10-01 — Added documentation-bloat and enforcement-and-cleanup topics.
- 2026-10-01 — Added the reference-wrappers specification topic.
- 2026-10-01 — Added an evaluation-harness template, a "skills worth having" list, stall triage, and nested-instruction guidance.
- 2026-10-01 — Added the self-contained worker brief and "return findings only" rule; marked the guide as experience-derived.
- 2026-10-01 — Added instructions for bringing the playbook (templates, patterns, assets) into a project.
- 2026-10-02 — Added a working-agreement section and adopted one for this project; verified the Writerside build (0 errors).
- 2026-10-02 — Clarified provenance: the guide extracts the real solutions used and being built in Tagwell (read-only), kept current as it evolves.
- 2026-10-02 — Added a "What this is" page as the document's start page.
- 2026-10-04 — Added the operating loop (route-before-implement, delegate-whenever-safe, ordered queue, explicit stop conditions) and the "user is not the delegation trigger" rule.
- 2026-10-04 — Added independent review (a swappable reviewer behind a stable contract).
- 2026-10-04 — Added portable agent configuration: one `models.json` source of truth usable in both OpenCode and Claude Code.
- 2026-10-04 — Extended parity to skills, harness-set checks, and Claude worker shell enforcement via a PreToolUse hook.
- 2026-10-04 — Added provider portability (GitHub vs GitLab) to independent review and the enforcement ladder.
- 2026-10-04 — Adopted n8n as the provider-neutral advisory reviewer; added the GitLab adapter and a GitLab review workflow.
- 2026-10-04 — Added CI "check silently didn't run" gotchas and advisor token permissions (from the Tagwell PR-review bring-up).
- 2026-10-04 — Moved the guide to GitHub-flavored Markdown in the `agentic-approach` repository, with a bundled harness and a blank Maven + React app. Dropped the Writerside instance and its sample topics; the TOC is now `guide/README.md`.
- 2026-10-04 — Bootstrap checklist: pick the typed baseline before the first commit (retrofitting causes churn and phantom gates).
