# Portable agent configuration (OpenCode + Claude Code)

The same workflow should run on either harness without maintaining two copies. This is how to keep
**one source of truth** for the parts that differ between OpenCode and Claude Code, and reuse the parts
that don't.

## What is shared vs. what differs

- **Shared:** the agent's *body* (its instructions), the review rubric, the assignment template, the
  wrappers, the docs — all harness-neutral.
- **Differs:** the frontmatter (file location, field names), and the **model identifier**.

Because both harnesses read an agent's `model:` **literally** (no variable substitution), the value
must appear in each agent file. Don't edit it there — single-source it and generate/verify.

## Single source of truth: `models.json`

Define each role once, with a value per harness:

```json
{
  "models": {
    "worker":   { "opencode": "openrouter/poolside/laguna-s-2.1", "claude": "haiku" },
    "reviewer": { "opencode": "openrouter/openai/gpt-6-luna",     "claude": "sonnet" }
  },
  "agents": {
    "worker": "worker",
    "pr-reviewer": "reviewer"
  }
}
```

A plain string value is also accepted and applied to every harness. Put the file where both can see it
(for example `.opencode/models.json`) and let a small script own the `model:` lines.

## Where the agent files live (same body, different frontmatter)

| | OpenCode | Claude Code |
| --- | --- | --- |
| Directory | `.opencode/agents/<name>.md` | `.claude/agents/<name>.md` |
| Required fields | `description`, `mode` | `name`, `description` |
| Model field | `model:` (`provider/model`) | `model:` (alias, full ID, or `inherit`) |
| Tool control | `permissions:` list | `tools` / `disallowedTools` |

Reviewer example — **same body**, two frontmatters:

```md
# .opencode/agents/pr-reviewer.md
---
description: Read-only PR/diff reviewer. Reviews against the review rubric. Never edits.
mode: subagent
model: openrouter/openai/gpt-6-luna
permissions:
  - action: "*"        # deny all...
    resource: "*"
    effect: deny
  - action: read       # ...except reads
    resource: "*"
    effect: allow
---
```

```md
# .claude/agents/pr-reviewer.md
---
name: pr-reviewer
description: Read-only PR/diff reviewer. Reviews against the review rubric. Never edits.
model: sonnet
tools: Read, Grep, Glob
---
```

The body (shared) is the reviewer prompt from [Independent review](independent-review.md).

## The sync script

A single script reads `models.json` and writes the `model:` line into whichever harness directories
exist, and `--check` fails on drift for CI:

- `node scripts/sync-agent-models.mjs` — set the `model:` lines.
- `node scripts/sync-agent-models.mjs --check` — fail if any agent file disagrees with the source.

Skip a harness cleanly when its directory is absent (`if (!existsSync(dir)) continue`), so one project
can carry one harness today and add the other later with no change. The script spec is in
[Reference wrappers](reference-wrappers.md).

## Closing the gaps between harnesses

Symmetry needs more than shared model values:

- **Agents** — same ids in `.opencode/agents/` and `.claude/agents/`; bodies shared, frontmatter differs.
- **Models** — single-sourced in `models.json`, synced into both trees.
- **Skills** — same ids in `.opencode/skills/` and `.claude/skills/`. Skill *bodies* adapt to tool names
  (Claude's `Agent`/`Read`/`Glob` vs OpenCode's `subagent`/`read`/`glob`), so they are authored per
  harness, not single-sourced. A parity check keeps the *set* equal.
- **Enforcement** — OpenCode bounds a worker's shell with the agent `permissions` allowlist (e.g. only
  `node scripts/<name>*`). Claude Code has no per-agent shell allowlist, so add a `PreToolUse` **hook**
  on the worker agents that blocks anything outside the bounded wrappers and read-only git. Enforce,
  don't merely instruct.
- **CI** — run `sync-agent-models --check` (no model drift) and a parity check (same agent/skill set).

```yaml
# Claude worker frontmatter: enforce the shell allowlist the harness doesn't provide
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "node scripts/worker-shell-guard.mjs worker"   # exits 2 to block
```

Verify a guard like this by feeding it hook JSON directly (`{ "tool_input": { "command": "git push" } }`)
and asserting it blocks—then confirm it in a live session; a hook you have not exercised is a hypothesis.

## Adopt it

1. Add `models.json` (roles → per-harness model).
2. Copy the sync script and run `--check` in CI.
3. For each agent, keep **one shared body** and add the frontmatter for each harness you use.
4. Reference the model from `models.json` only; never edit a `model:` line in an agent file by hand.

## Caveats

- Identifiers differ per harness — a `provider/model` id in OpenCode may be an alias (`haiku`) in Claude
  Code. One property means one *role → per-harness value* map, not one literal for both.
- Claude Code can also set **one model for all subagents** via `CLAUDE_CODE_SUBAGENT_MODEL` (and
  `CLAUDE_CODE_SUBAGENT_MODEL_FORCE`) in `settings.json` `env` — a coarse default, not per-role.
- `inherit` (Claude) / omitting the model means "use the session model" — the way to avoid repeating a
  value where a role should match the orchestrator.
