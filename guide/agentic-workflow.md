# Orchestrator and worker roles

Coding-agent CLIs typically provide a primary session and ways to delegate work to subagents or workers. Keep the primary session as the orchestrator for every task, and define a few focused worker roles for bounded delegation. Workers are part of the operating model, but dispatching one is not mandatory for every request. Configuration and exact capabilities vary by CLI; see the OpenCode and Claude Code setup topics.

## The orchestrator owns the outcome

The orchestrator should:

- Read the repository's instructions, current plan, and relevant code before proposing a change.
- Clarify the goal, acceptance criteria, constraints, and what is explicitly out of scope.
- Collaborate with the user on intent and design: surface meaningful alternatives, make assumptions visible, and use user feedback to steer implementation without offloading routine technical decisions to them.
- Decide whether to work directly, delegate, ask the user, or stop for more evidence.
- Keep shared contracts and cross-cutting decisions coherent.
- Assign exact file scopes and avoid concurrent writes to the same files.
- Review returned diffs, verify scope, run the integration-level checks, and report what remains unverified.
- Own Git operations, integration, and any action with broader environmental impact unless the project explicitly chooses another model.

The orchestrator is not a relay that blindly merges worker output. It owns the judgment about whether the result solves the right problem. The user and orchestrator retain product and technical judgment; workers carry out bounded work and report evidence.

## Task breakdown: orchestrator and workers

| Task area | Orchestrator (with the user) | Worker |
| --- | --- | --- |
| **Intent and product judgment** | Collaborate with the user to understand the desired outcome, taste, constraints, and acceptable tradeoffs. Ask the user about choices that depend on their goals. | Does not decide what the user wants or redefine the goal. Flags ambiguity it discovers. |
| **Technical direction** | Choose the approach, resolve cross-cutting questions, define acceptance, and decide what must remain centralized. | Can investigate alternatives and return evidence or a recommendation; does not own the decision. |
| **Task decomposition** | Choose which work to delegate; assign the least expensive suitable worker, exact writable files, context, constraints, and measurable acceptance criteria. | Works only within the assignment; does not expand scope or reassign other work. |
| **Repository reconnaissance** | Set the question and synthesize findings into the overall understanding. | Search code/docs, map dependencies, locate examples, and return concise findings with paths and evidence. Good default offload when it saves orchestrator context. |
| **Implementation** | Own tightly coupled changes, shared contracts, architectural choices, and integration seams. Decide whether a proposed implementation fits the intent. | Implement well-scoped slices, tests, and documentation in the assigned files. Prefer a diff and brief report over whole-file restatements. |
| **Mechanical work** | Define the exact transformation and inspect the result. | Perform repetitive edits, renames, formatting, link/frontmatter changes, or other low-judgment work when a cheaper worker can do it reliably. |
| **Diagnosis and review** | Decide which failures matter, what to fix, and whether review findings are valid. | Classify logs or large reports, critique diffs, identify likely causes, and suggest minimal fixes. Return root-cause buckets and relevant evidence, not raw logs. |
| **Verification** | Set the quality bar, inspect scope, run or schedule integration-level checks, and determine what is actually accepted. | Self-check with permitted bounded commands and report exact commands, results, and limitations. Self-verification is evidence, not final acceptance. |
| **Pre-commit code quality / anti-slop** | Require a proportionate quality gate before commit; judge findings, accepted tradeoffs, and whether the final diff is ready. | Independently review the final diff for correctness, project best practices, missing tests, dead code, unnecessary dependencies, needless complexity, and speculative abstractions. Return evidence-based findings; do not silently rewrite the work. |
| **Integration and shared state** | Integrate changes; own Git, shared contracts, and consequential environment operations according to project policy. Serialize conflicting builds, evaluations, or shared-state access. | Avoid overlapping writes and prohibited operations. Do not run Git or shared-environment operations unless the project explicitly grants that responsibility. |
| **User-facing update and continuity** | Keep the user oriented, present decisions or tradeoffs when needed, provide the final concise result, and maintain plans/handoffs for work that spans sessions. | Return a compact diff, summary, verification evidence, and blockers to the orchestrator; do not message the user directly or make the user coordinate worker details. |

**Routing rule:** offload bounded execution and evidence-gathering wherever it reduces total cost without lowering quality. Keep intent, judgment, synthesis, integration, and acceptance with the user and orchestrator. A worker can recommend; the orchestrator decides, and the user decides product tradeoffs.

## Make delegation the default, not a reminder

For every substantive coding or documentation task, the orchestrator should do a quick **delegation-first pass before implementation**:

1. Identify the decisions and user collaboration that must stay in the primary session.
2. Break the remaining work into bounded, checkable worker assignments.
3. Route each assignment to the least expensive worker that can meet its quality bar.
4. Dispatch eligible work without waiting for the user to remind it to delegate.
5. If work stays in the primary session, briefly name why: no suitable worker, tightly coupled live collaboration, or dispatch/context/review cost exceeds the work.

This does not require launching a worker for every keystroke. Trivial edits, rapidly changing prototypes, work requiring continuous user steering, and tasks with no economical worker are valid direct-work exceptions. The key is to actively consider delegation instead of treating it as an optional afterthought.

For a substantial task, a short update such as “I’ll delegate the UI and test slices; I’ll settle the API contract with you and integrate the results” makes routing visible. Keep small tasks lightweight. If the user repeatedly has to say “delegate this,” treat that as a workflow defect and strengthen the persistent instruction or routing skill for that task class.

Good delegation targets are separable: the work can be explained briefly, the needed context can be named, and “done” can be checked. Keep work in the primary session when it depends on unresolved product intent, simultaneous edits to shared files, rapid back-and-forth, or a final decision only the user can make. Do not split work merely to maximize parallelism, and do not use task size alone as the threshold—compare the worker cost plus context transfer, review, and rework against doing the legwork directly.

## The operating loop

Two failure modes are common and worth designing against directly: the orchestrator quietly does everything inline, and it stops after each item instead of continuing through an approved plan. Both come from the same cause—delegation is left to judgment and stopping is the default. Make them structural:

1. **Route before implementing.** Before writing code, emit one short line: `route: delegate <worker> <slice> | inline because <reason>`. This makes the decision visible instead of silent.
2. **Delegate whenever any bounded part can be safely delegated.** Delegation is the default, not a favor to the user. The user is **never the trigger**—do not wait to be asked or reminded; if a slice is separable and safe, dispatch it. Inline is the exception, and it needs a reason (no disjoint slice, continuous user steering, or dispatch cost exceeding the work).
3. **Work the approved queue top to bottom.** Keep a visible checklist and, after finishing an item, immediately start the next unblocked one. A plan/handoff should carry an ordered queue, not a single step.
4. **Stop only for a defined reason.** A needed user decision, a scope change, a destructive or irreversible action, a verification failure you cannot fix, or the end of the queue. Anything else means continue—do not re-ask about already-approved steps.
5. **End every turn with the next action.** A completion report closes with either “starting ⟨next item⟩” or “blocked on ⟨decision⟩.” Never a bare summary that waits to be prompted.

**Resolve the tension with “answer before act.”** Answer-before-act governs *new or ambiguous requests*, not the execution of an already-approved plan. Once a plan or step is approved, execute it; do not reinterpret approval as a reason to stop and ask again.

If a rule here keeps needing user reminders, treat it as a harness defect: change the mechanism (a forced routing line, a checklist, a queue) rather than restating the rule. See [improving from evidence](learn-from-evidence.md).

## Task breakdown by technical area

These are common assignment shapes, not a requirement to create one agent per technology. Follow the target project's architecture and give workers exact file ownership.

| Area | Orchestrator (with the user) | Worker |
| --- | --- | --- |
| **React frontend** | Collaborate on user-visible behavior, interaction details, accessibility expectations, and the feature's API contract. Check the final user journey across components. | Implement assigned components/hooks/styles and focused UI tests; follow the existing component and state-management patterns. Return screenshots or visual evidence only when the environment supports capturing and inspecting them. |
| **Spring / Java backend** | Own domain behavior, module boundaries, authorization semantics, API contracts, and cross-module decisions. Integrate the use case end to end. | Implement assigned controller/service/adapter slices and unit tests using the project's conventions, dependency-injection style, and architecture boundaries. |
| **Database and migrations** | Decide data semantics, compatibility requirements, rollout order, tenant/isolation constraints, and acceptable data risk. Approve destructive or production data operations. | Draft schema migrations, repositories, queries, and focused tests within an exact scope. Check backward compatibility and report the migration's assumptions; do not run unapproved destructive or live data changes. |
| **Infrastructure (Docker / Kubernetes)** | Own environment boundaries, networking, rollout strategy, and authorization to apply changes to shared or production systems. | Edit scoped Dockerfiles, Compose/Kubernetes manifests, health checks, or deployment documentation. Validate syntax and static behavior with bounded checks; do not apply to a cluster or remove volumes unless explicitly authorized. |
| **Testing and quality** | Choose the acceptance bar and test layers; decide when to run shared integration, end-to-end, performance, or full-suite checks. Evaluate failures against user intent. | Add or run focused unit/component tests, contract checks, and bounded suites allowed by the assignment. Report exact commands, results, flakiness, and gaps. |
| **Documentation** | Decide the durable message, user audience, and where the information belongs. Ensure the docs agree with implementation and other canonical sources. | Draft or update specifically assigned pages, examples, diagrams, and links. Check terminology and links; do not invent behavior that code or evidence does not support. |
| **Cross-layer feature** | Collaborate with the user on the experience and acceptance criteria; settle the API/data contract and sequence before parallel work. Integrate the feature and judge end-to-end behavior. | Work on disjoint layers or artifacts after the contract is clear—for example, a frontend slice, backend slice, tests, or docs—without editing shared contract files concurrently. |

### Split full-stack work at the contracts

For a change spanning UI, API, database, and infrastructure, do not simply assign “frontend” and “backend” and hope they converge. The orchestrator first makes the shared contract explicit: request/response shapes, error behavior, authorization, data semantics, and migration/rollout constraints. Then delegate file-disjoint slices against that contract. Keep a single owner for any contract file, and have the orchestrator run the integration checks that exercise the path end to end.

Infra and database workers may draft and validate changes without receiving authority to operate the live environment. Editing a deployment manifest is different from applying it; writing a migration is different from running it against persistent data.

Before a commit, run the project's fast automated quality checks and a focused review of the final diff. A lower-cost worker can perform the first-pass anti-slop review; the orchestrator owns the final quality gate and Git operation. Keep the review proportional: a tiny mechanical change may need only the relevant automated check, while a cross-layer or high-risk change merits deeper review. For a change that lands through a PR, add an [independent review](independent-review.md) by someone who did not write it—an agent today, a human later, behind the same contract.

## Workers produce bounded results

Give a worker one assignment with a concrete output. Common worker jobs include:

| Worker type | Good fit | Keep with the orchestrator |
| --- | --- | --- |
| Implementation | A well-specified change with local tests and a short list of writable files | Cross-cutting architecture and acceptance decisions |
| Mechanical editor | A precise rename, frontmatter change, formatting pass, or link update | Ambiguous refactors or behavior changes |
| Reviewer / diagnostician | Review a diff or classify failures in a large report or log | Final severity judgment and what to fix |

Use fewer roles than the task tempts you to invent. A worker should be differentiated by a stable responsibility or permission boundary, not just a different name.

## A repository-specific example

Tagwell uses two fixed worker tiers: `worker` for implementation, critiques, and diagnosis; `worker-xs` for precise mechanical edits. Its root instructions require delegations to use those agents, prohibit worker Git writes, and keep model selection in each agent definition rather than relying on a per-dispatch override. The exact provider and model IDs are configuration choices, not part of the reusable pattern.

The orchestrator keeps broad judgment tasks, final integration, and the verification gate. It can delegate diagnosis of a large evaluation report and request failure categories plus a minimal proposed fix, instead of spending its own context on raw logs. If the configured worker agents are unavailable, Tagwell's text-only CLI fallback returns a patch or explanation for the orchestrator to apply; it does not pretend to have changed files.

These are local policies shaped by that repository. A different project may allow other worker agents or assign Git ownership differently, but it should still make those boundaries explicit.

## A typical cycle

1. **Orient:** read `AGENTS.md`, relevant nested instructions, and the active plan or handoff.
2. **Frame:** state the desired result, acceptance checks, scope, and risks.
3. **Route:** delegate only independent, bounded work; keep shared interfaces and decisions centralized.
4. **Observe:** dispatch long-running workers in the background and announce the job and expected completion signal.
5. **Inspect:** compare each diff with its assignment; reject out-of-scope changes.
6. **Verify:** run the appropriate project checks and distinguish worker self-checks from integration checks.
7. **Close:** update the living plan and prepare a concise handoff when the work is ending or needs a fresh session.

See [safe delegation](delegate-safely.md) for an assignment template and [context continuity](preserve-context.md) for the cold-start procedure.
