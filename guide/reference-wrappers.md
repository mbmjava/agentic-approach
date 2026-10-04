# Reference wrappers

A **wrapper** is a small script that makes a slow, hanging, or hard-to-interpret operation safe to run from an agent: bounded in time, observable, and honest about success. This topic is a **specification, not code**. A consuming agent should implement each wrapper in the target project's own stack (language, build tool, OS) and satisfy the contract here. The source project's `scripts/*.mjs` are one implementation to adapt, not to copy.

Use it with the [bootstrap checklist](bootstrap-checklist.md): add wrappers only where a real operation is slow, hanging, or ambiguous.

## How a consuming agent should use this

For each wrapper the project needs:

1. Identify the underlying command and why a raw call is unsafe (never returns, hides failure, or floods context).
2. Implement the wrapper in the project's stack, satisfying every item under **Contract**.
3. Prove it with the **Acceptance** checks—including a deliberately failed run.
4. Make the bounded command the documented, permitted path (in instructions and, where useful, agent permissions); discourage the raw form.
5. Keep the wrapper's name and usage stable so instructions and skills do not drift.

Satisfy the contract even if the implementation differs. A wrapper that returns a trustworthy exit status and cannot hang is doing its job.

## Bounded test / verification runner

- **Need:** a build, test, or integration command that can run for minutes and sometimes never exits, freezing an agent tool call.
- **Contract:**
  - Runs the underlying command with a **hard timeout**.
  - On timeout, kills the **whole process tree**, not just the parent.
  - Determines success from the **child process exit status**, not from a log marker.
  - Writes output to a **unique, reported log path**; clears stale output before each run.
  - Always returns a non-zero exit on failure or timeout.
- **Prevents:** the “hanging build” freeze, and “false green” from a stale `BUILD SUCCESS` line.
- **Acceptance:** a passing run returns 0 and prints the log path; a run that exceeds the cap returns non-zero within the cap, leaves no orphan process, and a rerun cannot read the previous run's marker.

## Worker self-verify wrapper

- **Need:** workers must verify their own change cheaply, but must not run unbounded commands, the app, or shared infrastructure.
- **Contract:**
  - Accepts a narrow target (one module and optionally one test class).
  - Enforces a hard cap so a stalled build **fails** instead of hanging.
  - Prints a one-line summary of what ran.
  - Is the only build-class command a worker is permitted to run; **serialized** (one at a time).
- **Prevents:** workers hanging a session, and parallel builds colliding on shared output/ports.
- **Acceptance:** compile-only and single-test modes both work; an over-cap run fails; two concurrent invocations do not corrupt output.

## Non-blocking server start / stop with readiness

- **Need:** the app or a dev server runs forever; calling it directly blocks the agent.
- **Contract:**
  - Launches the server **detached** so the caller returns.
  - Records the process/instance identity in a known place for stop.
  - Polls a **readiness signal** (log marker and/or port probe) with a **hard cap**; returns 0 when ready, non-zero when not.
  - Truncates stale logs first so a previous run's marker cannot fake readiness.
  - A stop command terminates the whole tree.
  - **Idempotent:** if already running, does not start a second instance.
- **Prevents:** the “monitor hang,” double-instances on one port, and false-ready from an old log.
- **Acceptance:** start returns promptly and the server is reachable; a second start is a no-op; stop actually frees the port; an intentionally unreachable start returns non-zero within the cap.

## Docs / metadata / link check

- **Need:** docs drift silently—missing metadata, broken relative links, wiki-link syntax that won't render.
- **Contract:**
  - Validates required frontmatter fields and allowed values on governed files.
  - Resolves relative Markdown links to existing targets; ignores absolute/URL/anchor links.
  - Flags disallowed syntax (for example `[[wiki-links]]`).
  - Ignores fenced/inline code so examples don't count.
  - Fails with a per-file, per-issue message and a remediation hint.
  - Runs fast enough to be a required CI check.
- **Prevents:** dead links, inconsistent metadata, and unrendered wiki-links.
- **Acceptance:** a broken link and a missing field each fail with the exact path; a clean tree passes; code samples containing link syntax do not false-positive.

## Generated-index freshness check

- **Need:** hand-maintained indexes (code maps, TOCs) drift and then mislead.
- **Contract:**
  - Regenerates the index from source and **fails if the committed copy differs**.
  - Provides a `--check` mode for CI and a write mode for developers/agents.
  - Marks the artifact as generated so no one hand-edits it.
- **Prevents:** a stale navigation index that is worse than none.
- **Acceptance:** editing source without regenerating fails the check; regenerating makes it pass; content outside generated markers is preserved.

## Visual inspection delegation

- **Need:** an agent must not claim to have “seen” an image or screenshot.
- **Contract:**
  - Routes an image path to a vision-capable step and returns **only findings**.
  - States plainly when the image is not reachable.
- **Prevents:** fabricated visual claims.
- **Acceptance:** a real image returns concrete findings; a missing path returns an explicit error, not a guess.

## Text-only model fallback

- **Need:** when agent delegation is unavailable, still get a draft without pretending files changed.
- **Contract:**
  - Sends a bounded, well-scoped task to a model and prints the result as **text**.
  - Caps output; the caller applies the result and verifies it.
  - Never claims to have edited files or run commands.
- **Prevents:** silently treating generated text as an applied patch.
- **Acceptance:** returns text within the cap; the caller can diff/verify the applied change.

## Specifying a new wrapper

When the project needs a wrapper not listed here, describe it before implementing:

```text
WRAPPER: <name>
NEED: <the operation and why a raw call is unsafe>
CONTRACT:
- <guarantee 1>
- <guarantee 2>
FAILURE MODES PREVENTED: <what goes wrong without it>
ACCEPTANCE: <prove it, including the failure path>
ADAPT: <stack-specific notes; placeholders to fill>
```

Keep the contract minimal but complete: bounded in time, observable, and honest about success.

## Anti-patterns

- Printing “done” and exiting 0 before the work has actually completed.
- Trusting a log marker instead of the process exit status.
- A timeout that kills only the parent and leaves orphans.
- A wrapper so slow it becomes the reason people bypass CI.
- Copying a wrapper from another repo without adapting ports, module names, and paths.
