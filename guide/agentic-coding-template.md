# A low-friction agentic-coding template

Keep the orchestrator-and-worker approach as the backbone: the primary agent owns the task, user interaction, judgment, and final result; workers absorb as much bounded legwork as is economical without reducing quality. The goal is not to minimize delegation. It is to protect the expensive orchestrator context for collaboration, synthesis, and decisions while using lower-cost workers for suitable production and analysis.

## Optimize three things together

- **Productivity:** get to a working result quickly; avoid waiting on unnecessary approvals, agent round-trips, and broad test runs.
- **Economy:** optimize the total cost of a correct, accepted result—not just the number of calls. Offload well-scoped research, implementation, mechanical edits, and diagnosis to a lower-cost suitable worker when that costs less than doing the work in the orchestrator context plus review and rework. Keep coordination and output compact.
- **Collaboration and user experience:** let the user steer intent, taste, and tradeoffs while the model contributes technical exploration and implementation. Make meaningful progress visible, clarify only when an answer changes the solution or risk, and finish with a concise account of what changed and what was checked.

These goals can conflict. Let the user choose when they have a clear preference; otherwise use sensible defaults and escalate only when uncertainty or impact warrants it.

## Pick a working mode

| Mode | Use when | Default behavior |
| --- | --- | --- |
| **Fast lane** | Small, reversible, well-understood change | The orchestrator frames the task and keeps the user interaction light. It may assign a tiny, exact task to a low-cost worker when dispatch is cheaper than direct implementation; otherwise it acts directly. Run a focused check and summarize the diff. |
| **Orchestrated lane** | Larger task with independent, bounded parts | Plan the split briefly, delegate only separable work, avoid overlapping writes, integrate and verify. |
| **Careful lane** | Ambiguous goal or high-impact, destructive, security-sensitive, production, or shared-state work | Inspect first, explain options and risks, get user direction before consequential action, then proceed in small verified steps. |

The orchestrator remains responsible in every mode. It may recommend a mode and explain why; the user can ask for more autonomy or more caution. Workers are the production and evidence-gathering lane, not a place to delegate judgment. Agentic coding should feel fluid, not careless—controlled cowboy mode, not a free-for-all.

## User experience loop

1. **Start from the user's intent.** The user can describe the outcome in ordinary language; they should not have to write a technical specification before getting help.
2. **Build shared understanding.** The orchestrator reflects the key interpretation, inspects the relevant project context, and makes important assumptions visible. It asks only when the answer could materially change the solution, risk, or scope.
3. **Collaborate on the shape.** The model can suggest a small number of concrete options and tradeoffs, sketch a design, or prototype a thin slice. The user supplies taste, domain knowledge, and feedback; the model incorporates that feedback rather than making the user manage implementation details.
4. **Route the work economically.** The orchestrator keeps task framing and decisions. It delegates bounded production, investigation, and verification-support work to the least expensive suitable workers; it handles work directly when dispatch, context transfer, and review would cost more.
5. **Keep the user oriented.** Announce genuinely long-running work and its expected completion signal; do not narrate every file read or routine tool call.
6. **Close the loop.** Show what changed, the focused checks and their outcomes, and anything important that remains unverified. Make it easy for the user to react and steer the next iteration.

For an explicitly exploratory request, brainstorm or prototype without pretending that a sketch is production-ready. For a clear implementation request, do not turn every ordinary coding choice into a permission question or require magic approval phrases for obvious, low-risk steps. Ask before crossing meaningful risk or authorization boundaries.

## Spend effort where it buys confidence

- Keep the primary agent as the user's single point of coordination and judgment. It should not spend expensive context doing routine file production when a lower-cost worker can do it to the required quality.
- Before substantive implementation, require a delegation-first pass. Default to assigning eligible bounded legwork to lower-cost workers: targeted repository reconnaissance, mechanical edits, first-pass implementation, focused test writing, bulk documentation updates, and diagnosis of large logs or reports. Do not wait for the user to remind the orchestrator to delegate. Ask workers for a concise summary, relevant evidence, and a diff—not a transcript or raw output dump.
- Avoid duplicating the same work across workers. Parallelize disjoint tasks when the time or cost saved exceeds coordination and integration costs; otherwise delegate serially or do the task directly.
- Select model capability to fit the job. Use cheaper/faster workers for mechanical or well-constrained tasks when they perform reliably; reserve higher-cost reasoning for ambiguity, architecture, synthesis, and difficult decisions. Reassess with actual quality, rework, latency, and cost evidence rather than assuming model tiers are interchangeable.
- The orchestrator owns task decomposition, product and technical tradeoffs, contract decisions, integration, quality thresholds, final verification, and acceptance. Bring product choices to the user; do not ask workers to decide what the user wants.
- When a substantive task is done directly, the orchestrator should know why no worker assignment was more economical; state the reason briefly when it helps the user understand the route.
- Run the narrowest relevant test first. Expand to module, integration, or full-suite checks when the change's scope and risk justify the added time.
- Before committing, run the project's fast quality gate—formatting, focused tests, and configured static analysis (SonarQube, or the project's analyzer — the starter uses SpotBugs/PMD/Checkstyle) — and a diff-focused best-practices/anti-slop review. Look for correctness issues, missing tests, needless complexity or dependencies, dead code, and speculative abstractions. Keep review depth proportional to the change; the orchestrator makes the final accept/rework decision.
- Keep persistent instructions concise. Put occasional procedures in skills and recurring prompt shapes in commands instead of injecting a large rulebook into every interaction.
- Fail loud and bound the loop. Surface errors instead of masking them, and give agents clear stop conditions.
- Use plans and handoffs for work that spans sessions, not for every small request.

### Skills worth having

A small set of skills pays for itself across projects. Add others only when a procedure repeats:

- **Handoff prep** — the checklist that closes a workstream and produces the [handoff template](templates.md).
- **Spec / PRD generation** — turn a request into a reviewable requirement doc on demand.
- **Assignment / delegation** — the [worker assignment template](delegate-safely.md) as a reusable skill.
- **Visual inspection** — delegate screenshots and images to a vision step; never claim to have seen them.
- **Evaluation run** — drive the [evaluation harness](templates.md) for a non-deterministic feature.

Keep each skill focused on one responsibility and short; a mega-skill is an [anti-pattern](anti-patterns.md). The starter ships four of these — `generate-prd` (spec/PRD), `prep-handoff`, `vision` (visual inspection), and `worker` (assignment/delegation).

### Minimize wasted context

- Give each worker a focused goal, exact files or search target, relevant project rules, and an expected compact output. Do not forward the whole conversation or duplicate another worker's investigation.
- Let workers inspect large repositories, logs, and test reports in their own context; ask for findings with paths and a diff or evidence, not a raw dump into the orchestrator session.
- Have the orchestrator summarize and route the useful result to the user instead of rereading every detail when the summary and evidence suffice.
- Keep persistent instructions and worker descriptions short. Link to detailed skills or standards and load them only when relevant.
- Track repeated context transfer, unnecessary agent calls, and rework; delegation saves tokens only when its returned result is useful.

## Plan token use and cost

Estimating the orchestrator/worker token split and comparing model costs is its own subject. Keep those figures in one place so they stay consistent: see [Token economics and cost](token-economics.md). In short, reserve expensive orchestrator context for collaboration and judgment, offload bounded work to suitable lower-cost workers, and measure the total cost of an accepted result—not token share alone.

## Minimal project starting point

Start with one short project instruction entry point containing real project facts and a few durable expectations. `AGENTS.md` is a useful cross-tool choice; Claude Code can also use `CLAUDE.md` or import `AGENTS.md`. See [OpenCode setup](configure-opencode.md) and [Claude Code setup](claude-code-setup.md) for loading behavior. For example:

```md
# Project guidance

- Follow the existing architecture and style; inspect nearby code before editing.
- Follow the central engineering standard at `<versioned standards link>`; keep only project-specific instructions here.
- Keep the primary agent accountable. Before substantive implementation, delegate bounded legwork to the least expensive suitable worker when it reduces total effort without lowering quality; do not wait for the user to remind you.
- Ask before destructive, production, shared-data, or out-of-scope operations.
- Run `<focused verification command>` after relevant changes.
- Before committing, pass `<project CI / SonarQube quality gate>` and the proportionate diff review.
- Report changed files, checks and results, and anything not verified.
```

Replace placeholders with commands that exist in the project. Add custom agents, tighter permission rules, bounded wrappers, skills, commands, and a plan/handoff convention only when the project's repeated work or risk justifies them.

## Keep engineering standards central

For a developer working across multiple projects, keep shared engineering standards in one discoverable, versioned Git repository or documentation set. Make it the single source for reusable coding conventions, architecture and testing practices, code-quality/anti-slop criteria, review expectations, and agent collaboration rules. Link to or load that source from each project rather than copying large, nearly identical rules into every `AGENTS.md`, `CLAUDE.md`, or worker prompt.

Keep each project entry point short: identify the applicable standards version or path, document project-specific commands and architecture, and state only local deviations. Give deviations a reason so they do not silently become a competing standard. When the CLI cannot automatically load an external standards location, make the path explicit and ensure the agent has read access; a link in a prompt is not useful if the agent cannot retrieve it.

The shared guide should remain tool-neutral. Keep OpenCode and Claude Code loading/configuration instructions in their respective adapter topics, and have both point back to the same common standards. Pinning a released standards version improves reproducibility; periodically update projects to incorporate improvements instead of allowing permanent drift.

Use tools such as SonarQube as a complement: central standards define what good code means, while a configured quality profile and gate can consistently check the machine-detectable subset. Keep subjective design judgment and final acceptance with the user and orchestrator.

## Make autonomy explicit when setting up a project

When asking an LLM to set up or refactor a project, include a preference such as:

```text
PRIORITIES: <speed | total cost | quality | user control | a balance>
AUTONOMY: <suggest a plan first | implement clear low-risk work | other>
DELEGATION: <offload bounded legwork by default when economical | delegate selectively | other>
CHECKS: <fast focused checks | full relevant tests | ask before slow/live checks>
```

The LLM should preserve those preferences in concise project guidance, while still asking before actions that cross stated safety boundaries. See [LLM setup and refactor prompts](llm-setup-and-refactor.md) for assessment and implementation templates.
