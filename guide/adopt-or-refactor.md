# Adopt or refactor an agentic environment

Use this guide as an implementation baseline, not a drop-in configuration bundle. A new repository can adopt the controls in stages; an existing repository should inventory what already works, identify the highest-risk gaps, and change those without discarding useful local conventions.

## Start with an inventory

Before changing an existing setup, locate and inspect:

- Project instructions such as `AGENTS.md`, including nested files and stale or conflicting rules.
- The chosen coding-agent CLI's project and global configuration, custom agents, skills, and commands.
- Central engineering standards, shared templates, or a standards repository referenced by the project.
- Worker dispatch patterns, assignment templates, and how each worker can access files and tools.
- Build, test, app, and container scripts—especially timeouts, output, process cleanup, and side effects.
- Existing pre-commit quality checks and reviews: formatters, linters, static analysis, focused tests, and any independent anti-slop/code-quality pass.
- SonarQube/SonarCloud project configuration, CI scan, quality profile, and quality gate, if present.
- Plans, handoffs, decision records, and scratch notes that influence current behavior.
- Local state, shared services, generated artifacts, and any production or remote access.

Then record each practice as one of:

| Kind | Meaning | Treatment |
| --- | --- | --- |
| Principle | Desired outcome, such as one accountable integrator | Keep unless the project has a good reason to change it |
| Policy | A local rule, such as who may run Git or operate containers | Confirm ownership and impact with the team |
| Mechanism | A permission, script, wrapper, or check that enforces policy | Test its actual behavior; do not assume the prose is enforcement |
| Observation | A result or lesson from one incident or experiment | Keep as evidence with limits; promote only after it is validated |

### Establish the shared standards source

If you work across projects, identify the canonical versioned engineering-standards repository or documentation set before creating more local agent instructions. Link or load the shared standards from each project's short instruction entry point, then add local architecture, commands, and justified deviations. Avoid copied standards that can drift. Keep tool-specific loading instructions in the OpenCode or Claude Code adapter, not in the tool-neutral standards themselves.

## Audit implementation, not just prose

For each rule, ask: **what prevents a violation, how would we detect one, and what happens on failure?** A sentence in an agent prompt may guide behavior, but it does not necessarily constrain a tool.

| Area | Audit question | Safer baseline |
| --- | --- | --- |
| Worker scope | Can a worker edit unrelated files despite its assignment? | Treat file lists as contracts; check changed paths against a recorded baseline. Use isolated workspaces for risky concurrent edits. |
| Agent permissions | Do allowed commands have unintended write or network behavior? | Allow the narrowest command form needed. For example, permit a generated-map check, not the generator that rewrites the file. |
| Process timeouts | Does timeout handling stop the whole process tree? | Test timeout behavior on the actual OS; look for orphaned shells, Maven/Java children, servers, and containers. |
| Completion evidence | Is success determined from the process exit status? | Capture a durable exit result. Do not treat a log marker alone as proof, especially for detached runs. |
| Shared state | Can parallel work collide in build output, ports, databases, or generated files? | Serialize conflicting work and document shared resources; isolate when the coordination cost is justified. |
| Live tests | Can a test mutate persistent or shared data? | Classify side effects and require an appropriate environment and authorization before running it. |
| Standards and code quality / anti-slop | Is there a discoverable source for team standards, and is the final diff checked for machine-detectable issues and avoidable complexity before commit? | Link to a versioned central standards source rather than copying divergent rules. Use SonarQube/SonarCloud or equivalent CI analysis for enforceable code-quality rules, plus a proportionate diff review for intent, architecture, missing tests, dead code, needless dependencies, and speculative abstractions. Keep the orchestrator responsible for accepting findings. |
| Continuity | Do the plan and handoff agree on the next action? | Maintain one live handoff and a resumable plan; reconcile conflicts before acting. |

## Use a staged adoption path

### Stage 1: Establish ownership and boundaries

Write a short project instruction file. Identify who owns goals and acceptance, who integrates changes, which actions are user-only, and what data or environments are off limits. Make routine local work distinct from production, destructive, and shared-environment operations.

### Stage 2: Make one worker task safe

Create one specialist worker and a reusable assignment template. Pilot it on a low-risk task with a small writable file set, a diff-based report, and a check the orchestrator can repeat. Confirm the real permission and workspace behavior before increasing parallelism.

### Stage 3: Bound the expensive commands

Add or improve wrappers for the project's slow or hanging commands. Verify timeout, cancellation, process-tree cleanup, unique logs, exit-status reporting, and data cleanup. Test those failure paths deliberately; a timeout setting that has never been exercised is only a hypothesis.

### Stage 4: Add continuity and evidence

Use a living plan for current state and a concise handoff for session changes. Add a decision record for hard-to-reverse choices. For non-deterministic workflows, establish a baseline before tuning and label generated reports as evidence with a date and configuration.

### Stage 5: Expand only after the pilot works

Add a mechanical worker, reviewer, skills, commands, or more parallel lanes only when repeated tasks justify them. Measure whether each addition reduces cycle time or errors enough to offset coordination, review, and model cost.

## Refactor in risk order

Do not rewrite the whole agent environment at once. A practical order is:

1. Clarify production and destructive-operation boundaries.
2. Fix permissions that accidentally allow a worker to rewrite generated files or run broader commands than intended.
3. Fix unreliable timeout and completion reporting for long-running tools.
4. Resolve conflicting live instructions and stale next actions.
5. Improve worker isolation and shared-resource scheduling.
6. Simplify duplicated or overly rigid process rules after the controls work.

For turning stated rules into checks (and for scheduling deletion), see [Enforcement and cleanup](enforcement-and-cleanup.md).

Keep a before/after note for each change: the observed failure mode, the control added, and the evidence that it works. Preserve effective conventions even if their file names or scripts differ from the examples here.

## Do not copy the example blindly

The source project's two worker tiers, paid-model requirement, local container permissions, bounded Maven scripts, and one-wave handoff practice are adaptations to its models, Windows environment, build system, and shared dev stack. A new or existing project should keep the underlying intent—scoped work, reliable verification, clear ownership, and resumable context—while choosing controls that match its actual tools and risks.

For copy-ready instructions to give an LLM, see [LLM setup and refactor prompts](llm-setup-and-refactor.md). This playbook can be read-only reference material in the target project's session: have that LLM assess the target itself, propose a bounded plan, then apply only the items you approve. For what to copy versus install, see [Bring the playbook into a project](bring-playbook-to-project.md).
