# Claude Code CLI setup

This is the **Claude Code-specific adapter** for the shared agentic-coding playbook. The orchestrator/worker split, delegation-first rule, cost accounting, user collaboration, and recovery approach stay the same; instructions, agents, permissions, and skills use Claude Code's own formats. To keep one source of truth across OpenCode and Claude Code, see [Portable agent configuration](portable-agent-config.md).

## Persistent project instructions

Claude Code uses `CLAUDE.md` files. Recent versions also support `AGENTS.md`, but the default instruction-file selection depends on whether a `CLAUDE.md` or `CLAUDE.local.md` exists above the working directory and on the **Project instructions** setting.

For a repository shared with tools that already use `AGENTS.md`, keep that as the common source and add a project `CLAUDE.md` containing:

```md
@AGENTS.md

## Claude Code-specific notes
- <only Claude-specific guidance>
```

This avoids maintaining two divergent copies. On Windows, use the import rather than a symlink. Verify that the instructions loaded with `/context`; check the current Claude Code memory documentation for version and settings behavior.

Keep always-loaded guidance short: workflow role boundaries, real build/test commands, architecture constraints, and delegation-first routing. Put large task procedures in skills rather than loading them into every session.

Use nested files deliberately: a subdirectory `CLAUDE.md` (or a path-scoped `.claude/rules/` file) can carry a subsystem's conventions so they load only when the agent works there. Keep the root file for repo-wide rules and avoid restating the same rule at both levels.

## Define focused worker subagents

Project subagents live in `.claude/agents/`. Each definition needs a unique `name` and a useful `description`; the description tells Claude Code when to delegate. Model and tool restrictions are set in the subagent's YAML frontmatter.

```md
---
name: worker
description: Use proactively for bounded implementation, focused tests, mechanical edits, and evidence gathering
model: haiku
---

Implement only the assigned task and files. Do not redefine the goal, expand scope, or make product or cross-cutting architectural decisions. Return a concise summary, exact diff, verification evidence, and uncertainties to the orchestrator.
```

Adapt `model: haiku` to the currently available model aliases and the worker's measured quality. The orchestrator should use workers for economical bounded legwork by default, but retain user collaboration, task framing, product and technical judgment, synthesis, integration, and acceptance. Subagent usage still contributes to Claude Code usage; measure total cost and rework rather than assuming delegation is free.

Subagents can be given limited tool sets with `tools` or `disallowedTools`. These restrict capabilities but do not automatically enforce a per-assignment list of writable files. For stronger isolation, Claude Code supports `isolation: worktree`; check the current worktree documentation and confirm the worker has the needed base state before using it. Otherwise, serialize overlapping writes and inspect the diff against the assignment.

## Skills, permissions, and hooks

- Put reusable procedures in `.claude/skills/<skill-name>/SKILL.md`.
- Configure tool allow/deny rules and project hooks in `.claude/settings.json` (personal settings in `.claude/settings.local.json`); a hook can also be scoped to one agent in that subagent's frontmatter (`hooks:` in `.claude/agents/<name>.md`) — the starter puts its worker shell guard there.
- Use hooks when a required action must run at a defined tool/lifecycle event. `CLAUDE.md` and subagent prompts guide behavior but are not hard enforcement.

Keep these files concise and non-contradictory. A delegation-first instruction can improve routing reliability, but it cannot guarantee that Claude Code will delegate; monitor whether the orchestrator actually dispatches workers and refine the description or project guidance when it repeatedly fails to do so.

## Session recovery

Use the shared playbook's versioned living plan and handoff as the recoverable record of task state. Claude Code auto memory can retain personal preferences and useful facts, but it is not a substitute for a project-visible plan, verified checkpoint, or durable decision record.

## Claude Code documentation

- [Subagents](https://code.claude.com/docs/en/sub-agents)
- [Memory and `CLAUDE.md`](https://code.claude.com/docs/en/memory)
- [Skills](https://code.claude.com/docs/en/skills)
- [Settings](https://code.claude.com/docs/en/settings)
- [Permissions](https://code.claude.com/docs/en/permissions)
- [Hooks](https://code.claude.com/docs/en/hooks-guide)
- [Worktrees](https://code.claude.com/docs/en/worktrees)
