# Use an LLM to set up or refactor a project

You can use this guide interactively with OpenCode, Claude Code, or another coding-agent CLI. Work in two distinct phases: ask the model to **inspect and recommend** first, then explicitly authorize a selected implementation. This lets the model adapt the baseline to the repository instead of blindly copying another project's files and rules.

Run the assessment from the target project root where possible, so the LLM sees the correct repository instructions and files. For a read-only reference project, state that constraint explicitly and do not grant write access.

## Phase 1: Assess without editing

Use this prompt for either a new-project setup or an existing-project refactor. Fill in the bracketed details.

```text
Help me establish or improve a productive agentic-coding workflow for this project.

PROJECT: <project name and purpose>
TOOL: <OpenCode | Claude Code | other>
MODE: <new setup | refactor existing setup>
WRITE POLICY: READ ONLY for this assessment. Do not create, edit, delete, or rename files.
SENSITIVE PATHS / SYSTEMS: <list, or unknown>
SPECIAL CONSTRAINTS: <production, shared services, OS, toolchain, budget, team conventions>
COST / DELEGATION PREFERENCE: <for example: keep expensive orchestrator context on user collaboration and judgment; offload bounded legwork to lower-cost workers when quality is maintained>

Inspect the existing repository instructions, the selected CLI's configuration and agents, task scripts,
tests, plans/handoffs, relevant documentation, and any central engineering standards or SonarQube /
equivalent CI quality-gate configuration. For a new project with little existing setup, identify what
is absent rather than inventing repository conventions.

Analyze implementation as well as documentation. For every important rule, distinguish:
- written instruction;
- tool/configuration control that actually enforces it;
- check or evidence that detects violations;
- failure mode or remaining gap.

Return:
1. A brief inventory of what exists and what works.
2. A prioritized gap list with evidence (file paths and relevant behavior), impact, and a small
   recommended change for each.
3. A proposed baseline that separates portable principles from project-specific choices.
4. An implementation plan with exact target files, acceptance checks, risks, and questions that
   need my decision.
5. A delegation map: which decisions stay with the user/orchestrator, which bounded tasks should go
   to workers, the least-cost suitable worker for each, and why any substantive work would remain in
   the primary session. Do not make delegation an afterthought or wait for me to remind you.

Do not assume prompt instructions enforce permissions.
Do not start implementation or run potentially destructive, production, or unbounded operations.
Wait for my approval of the plan.
```

## Phase 2: Implement an approved plan

After reviewing the assessment, name the accepted items and exact scope. Then use a prompt like this:

```text
Implement only the approved agentic-coding setup/refactor items below.

APPROVED ITEMS: <IDs or exact changes from the assessment>
FILES YOU MAY CHANGE: <explicit file paths; do not broaden this list>
ACCEPTANCE CHECKS: <specific commands and observable results, including a proportionate pre-commit code-quality/anti-slop review>
DO NOT TOUCH: <unrelated configuration, production systems, user changes>

Before editing, inspect the current working tree and preserve pre-existing changes. Keep project
conventions that do not conflict with the approved changes. Do not copy provider/model names,
paths, commands, permission rules, or timing thresholds without confirming they fit this project.

Implement in small reviewable steps. Do not commit, push, reset, or discard user changes unless I
explicitly ask. Do not run destructive or production operations. Use bounded checks and report the
exact commands and results; if a check could affect shared state, stop and ask first.

At the end, report changed files, a concise rationale, verification evidence, anything not
verified, and any remaining risks. Stop rather than expanding the approved scope.
```

An approval authorizes only the named implementation scope. If inspection reveals a new risk or a needed file outside that scope, pause and ask before proceeding.

## Prompt for a new project

When setting up a repository that has no agent workflow yet, start with the assessment prompt in `new setup` mode. Ask the LLM to propose a minimal first increment, typically:

1. A concise tool-appropriate project instruction entry point with real build/test commands and safety boundaries.
2. One worker agent and a reusable assignment template.
3. One or two bounded wrappers for genuinely slow or hanging commands.
4. A plan/handoff convention if work will span sessions.
5. A focused pilot task that proves the setup works end to end.

Add additional workers, skills, slash commands, automation, and parallel lanes only when the pilot reveals a recurring need. Have the LLM validate configuration against the selected tool's current documentation instead of guessing fields or relying on legacy examples.

## Prompt for an existing project

For a refactor, run the assessment in `refactor existing setup` mode. Ask the LLM to preserve successful local practices and prioritize actual implementation defects before rewriting prose. Typical first checks include:

- Whether agent permissions permit more than their assignments imply.
- Whether an allowed command can write generated files or cause side effects.
- Whether timeouts terminate child processes and leave no orphan jobs.
- Whether detached work exposes an authoritative completion status.
- Whether parallel workers share files, build output, ports, databases, or logs.
- Whether current plans, handoffs, and instructions agree about the next action.

Fix the highest-risk issue first, verify the control in the real environment, then proceed to the next item. Avoid a large refactor that changes policies, scripts, and documentation at once; that makes failures hard to attribute and rollback hard to review.

## Use this playbook from the target project

This repository (`agentic-approach`) is the **source playbook**. The target project's coding-agent session should read the relevant topics as external reference, inspect the target repository's current state, and adapt the recommendations. Do not treat examples from the source projects (such as the source project) as the target policy unless they fit and are explicitly adopted. For the mechanics—reference, copy, or install—see [Bring the playbook into a project](bring-playbook-to-project.md).

For a refactor, start a coding-agent session from the target repository. Point it at this guide (a local clone or the repository URL) and use a prompt like this:

```text
Use the agentic-coding workflow playbook at:
<absolute path or URL to the agentic-approach guide>

SOURCE: The playbook repository is reference material. Read it only; do not change it.
TARGET: This repository. Inspect its current state rather than relying on an old review.

Read the playbook landing page and the topics on configuration, safe delegation, productive
environments, context continuity, evidence, and adoption/refactoring. Then inspect this repository's current
project instruction files, the CLI's agent/skill configuration, relevant scripts, plans, handoffs, and docs.

First pass is READ ONLY. Compare the playbook recommendations with this repository's actual implementation.
Separate portable principles from project-specific rules, verify each suspected gap in code/config,
and report a prioritized plan with exact target files, risks, and acceptance checks. Do not edit files,
run destructive operations, or change shared/production state. Wait for my approval.

After I approve specific plan items, implement only those items in this repository. Preserve unrelated and
pre-existing changes, keep the playbook source read-only, use bounded checks, and report diffs plus
verification evidence. Ask before expanding scope or touching unrelated configuration, shared data, or production.
Keep product judgment and cross-cutting technical decisions with me and the orchestrator; use
appropriate lower-cost workers for bounded execution and evidence gathering when economical.
```

Replace the placeholder with a path that the target session can access. The CLI may require external-directory read approval; grant read access to the playbook only, and do not grant it write access. If the projects are on different machines, provide the published playbook URL or copy the relevant topic content into the target session instead. Check the current CLI's permissions and configuration behavior before adding a persistent external reference.

The prompts are process aids, not a security mechanism. Enforce critical boundaries with the CLI's permissions, operating-system access, isolated workspaces, and human approval for consequential operations.
