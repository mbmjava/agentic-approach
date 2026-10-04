# Build a productive agentic environment

The environment should make correct work easy to inspect and unsafe or unbounded work hard to perform accidentally.

## Make the repository self-describing

Provide a short `AGENTS.md` entry point, focused nested instructions where needed, and discoverable scripts for common operations. Include:

- Build, test, lint, and local start/stop commands.
- Architecture map, module boundaries, and links to deeper standards.
- Environment-specific constraints and anything the model commonly gets wrong.
- Bounded commands suitable for agent use and an explanation of what each proves.

Prefer generated maps and executable checks over hand-maintained indexes that drift.

## Make commands bounded and observable

Every potentially long task should have a clear completion signal, a timeout or cancellation path, and a place to inspect output. Use wrappers when the underlying build or server command may not return in an agent tool window. For the exact contract each wrapper must satisfy—and how a consuming agent should implement it in its own stack—see [Reference wrappers](reference-wrappers.md).

For a test wrapper, report the process exit status, not only a text marker in a log. For detached processes, record the process identity and log location and provide a reliable way to tell whether the job finished successfully. Delete or rotate stale output so one run cannot be mistaken for another.

### Stall triage

A silent session is not automatically a hang. Decide from what you announced:

- **Silence with an announced long-running job** — the silence *is* the job; wait for its completion signal.
- **Silence with nothing running** — treat it as a real stall; check the process and recover from the plan/handoff rather than waiting.
- **A hang right after a context reset or compaction** is usually the harness, not the task; isolate it with a trivial no-tool prompt before assuming the work is broken.

State the expected completion signal *before* starting a long step, so this judgment is possible later. Persist the running-job state (pid, log path) so a recovery session can tell what was expected to happen.

## Keep permissions matched to the environment

- Use read-only agents for exploration and review when editing is not needed.
- Give implementation agents only the tools they need for their bounded assignment.
- Make destructive operations, external directories, production systems, and shared infrastructure explicit boundaries.
- Keep routine local development operations distinct from actions on production or shared infrastructure.
- Review broad saved approvals; a convenience approval can silently outlive the task that justified it.

The user's approval is part of the workflow, not an obstacle to productivity. Ask before expanding scope or acting on an environment whose ownership or impact is unclear.

## Account for shared state before parallelizing

Check for shared `target/` directories, test databases, app ports, local service state, caches, and generated files. Parallelize only where those resources and file scopes do not collide. If separate worktrees are used, define who integrates and verifies their results.

## Keep the CLI workflow ergonomic

Use the selected CLI's interactive mode for collaborative work and its non-interactive mode for scripts where direct terminal output is the goal. Use skills for procedural knowledge that should load only when needed, and slash commands for common prompt shapes. Avoid building a command catalog for one-off tasks. See [OpenCode CLI setup](configure-opencode.md) or [Claude Code CLI setup](claude-code-setup.md) for tool-specific configuration.

The shared service, standalone mode, explicit server connections, and CLI preference files differ across products. Consult the selected CLI's current documentation rather than treating one tool's session or preference settings as universal.
