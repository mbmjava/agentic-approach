# Delegate safely and verify the result

Every delegation should reduce work for the orchestrator without creating ambiguity about ownership, allowed changes, or what counts as done.

The economic default is to offload bounded legwork to an appropriate lower-cost worker whenever it preserves quality. The orchestrator retains user collaboration, task framing, tradeoffs, cross-cutting synthesis, integration, and acceptance. Do not mistake “delegate aggressively” for “delegate decisions.”

The **user is not the delegation trigger.** Do not wait to be asked, told, or reminded. If any bounded part of the work can be safely delegated, delegate it—automatically, every time. Inline work is the exception and requires a stated reason.

## Assignment template

Adapt this for each worker. Keep the writable file list exact; name directories only when the worker truly owns every file in them.

```text
AGENT: implementation-worker | mechanical-worker | reviewer
ROLE: You are a subagent. Work from this brief alone and return findings/results to the orchestrator only. Do not message the user directly.

GOAL:
<one sentence: what to produce>

ACCEPTANCE:
- <observable, checkable result>
- <focused test or evidence>

FILES YOU MAY WRITE:
- <exact path>
- <exact path>

READ FIRST:
- <relevant instruction, contract, or sibling implementation>

CONSTRAINTS:
- <project conventions and commands the worker may run>
- <explicitly prohibited work>

REPORT BACK:
- unified diff or exact old/new snippets
- compact summary and test evidence
- uncertainty or blockers; stop rather than guess
```

This mirrors the Tagwell assignment protocol: a specific goal, acceptance criteria, strict write scope, reference context, conventions, out-of-scope boundaries, and a concise diff-based report.

### Make the brief self-contained, and return findings only

- **Do not forward conversation history.** A worker's prompt must carry everything it needs (goal, scope, contracts, paths) and nothing else. Passing the parent's accumulated dialogue causes context pollution and rot, and makes results unreproducible.
- **Declare the role.** Tell the worker it is a subagent that returns findings/results to the orchestrator and does not message the user directly. Workers that aren't told this act like standalone agents.
- **Return findings, not a transcript.** Ask for the diff, evidence, and blockers—not whole files, raw logs, or a play-by-play.
- **Verify worker output.** Treat a returned result as a claim to check, not a fact; the orchestrator reviews scope and integration.

For a mechanical-only worker, omit build and test authority if it is not needed. For a reasoning worker, name the permitted bounded verification scripts. Put the worker's model and tool policy in its agent definition; do not rely on a prompt to create a permission boundary.

## Scope parallel work by files and shared resources

- Never assign the same writable file to two workers at once.
- Keep shared interfaces, schemas, and decisions with one owner; ask workers to report proposed changes to them instead of editing them concurrently.
- Parallelize read-only reviews and mechanical edits freely only when their inputs and outputs are independent.
- Serialize tasks that contend for shared build directories, ports, databases, app instances, or evaluation data.
- Check the actual workspace-isolation model before parallel implementation. Child sessions are not, by themselves, a promise that file changes are isolated. Use separate worktrees or serialize writes when shared-checkout overlap is risky.

For long-running jobs, background the worker so the primary session can continue and receive a completion result. Announce the job and its completion signal; do not infer success from silence.

### Distinguish prompt contracts from enforced controls

An assignment's file list is an important coordination contract, but it is not automatically a tool-level sandbox. Static permissions can restrict broad resource classes or path patterns; they generally cannot infer the exact file list in each new prompt. For strict isolation, use a separate worktree or workspace, or serialize edits and inspect the diff before integration. Never describe a prompt-only instruction as a security guarantee.

**Prefer exact-command allowlists over patterns.** A worker's permitted commands should be named exactly — no glob/prefix patterns, arguments, chaining, pipes, or redirections. Prefix matching is fragile (a leading `*` was observed not to match at all, while a trailing `*` admitted more than intended), so a pattern quietly widens "bounded" as the repo grows. Enumerate the permitted invocations, one per line; when a stack needs a new self-check, add a dedicated no-argument wrapper rather than opening a pattern.

## Use two verification layers

Workers should self-check within their permitted tools and report the exact command and result. The orchestrator then checks:

1. The changed-file list is within the assignment.
2. The diff matches the goal and project conventions.
3. The change integrates with adjacent code and contracts.
4. The project-level acceptance checks pass.

Self-verification is useful evidence, not a substitute for the integration gate. Report checks that were not run as **not verified**.

In the Tagwell example, workers may run only an **exact, enumerated** set of repository wrappers — an allowlisted module compile (`node scripts/worker-verify.mjs <module>`), a strict frontend typecheck (`node scripts/frontend-worker-verify.mjs`), `check-docs`, and `code-map` — with no arguments, chaining, or pipes; git stays read-only (`status --short`, `diff`, `log`). The orchestrator serializes builds, checks `git status` after each worker pass, and rejects files outside the assignment. When migrating a typed frontend incrementally, the orchestrator **registers the worker's new file in the shared project** (e.g. `tsconfig.app.json`) *before* delegating the slice, because the no-argument verifier checks that shared project and cannot see an unregistered file. Adapt those exact commands to the target repository rather than copying them literally.

## Bound expensive or risky operations

Prefer repository scripts that enforce timeouts, log paths, cleanup, and reliable exit status over ad hoc foreground commands. Tagwell's `worker-verify.mjs`, `run-it.mjs`, and `app-start.mjs` are examples of wrappers built around observed hangs and shared-resource collisions.

Never call an operation safe simply because a script wraps it. Keep production, remote, destructive, and shared-environment actions behind explicit authorization and clear scope.

## Reject or rescope bad delegations

Reject out-of-scope writes. Reassign unclear work instead of quietly widening the worker's scope. If a worker cannot finish or the tool environment is unhealthy, treat that as a failed attempt: reduce the task, provide a safer bounded check, or do the work in the primary session.

When a configured worker is unavailable, a text-only model call can still draft a change, but the orchestrator must apply it, inspect the resulting diff, and run verification. Do not describe generated text as an applied patch.
