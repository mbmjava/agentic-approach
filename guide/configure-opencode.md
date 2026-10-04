# OpenCode CLI setup

This topic covers the **OpenCode-specific adapter** for the tool-neutral workflow in this guide. Keep configuration small, explicit, and aligned with the current OpenCode version. Start with repository instructions and only add agents, skills, commands, or permission rules when they solve a recurring need. For Claude Code, see [Claude Code CLI setup](claude-code-setup.md); to keep one source of truth across both harnesses, see [Portable agent configuration](portable-agent-config.md).

## Put durable project guidance in `AGENTS.md`

OpenCode V2 uses `AGENTS.md` for persistent agent guidance. Keep the root file short enough to be useful at every task start: build and test commands, architecture boundaries, environment-specific constraints, and links to deeper standards. Add nested `AGENTS.md` files only where a subsystem needs additional context.

Use nested files deliberately: a module-scoped `AGENTS.md` (for example one per package or service) can carry that area's conventions, key types, and local commands without loading them into every session everywhere. Keep the root file for repo-wide rules and let the nested files specialize. Avoid restating the same rule at both levels.

Treat these files as executable workflow policy. Review them as carefully as code, remove contradictions, and avoid making a durable rule out of a one-off incident.

## Define only the agents you need

Custom agents can be Markdown files in `.opencode/agents/`. Their frontmatter describes the agent; the Markdown body supplies its system instructions. V2 supports `primary`, `subagent`, and `all` modes. For example, a read-only reviewer can deny edits:

```md
---
description: Reviews a change for correctness and missing tests
mode: subagent
permissions:
  - action: edit
    resource: "*"
    effect: deny
---

Review the current change. Report concrete findings with file references.
Do not edit files.
```

Use a separate implementation worker only when it has a clear assignment protocol and tool boundary. Avoid baking a model name into a general strategy: provider availability, model names, and cost change. Choose and validate the model in the project configuration, and explain the capability the role needs.

## Use skills for reusable procedures and commands for shortcuts

- A **skill** in `.opencode/skills/<id>/SKILL.md` contains reusable task guidance, templates, or references. Its description helps OpenCode decide when it is relevant.
- A **command** in `.opencode/commands/<name>.md` is a prompt template invoked by a slash command. Use it to standardize a frequent request, not to hide a risky shell action.

For example, a handoff skill can enforce a checklist, while a `/review` command can provide a repeatable review prompt. Keep source instructions in `AGENTS.md`; V2's `instructions` config field is not currently loaded as an instruction source.

## Apply least privilege deliberately

OpenCode permissions use ordered rules with `allow`, `ask`, and `deny`; the last matching rule wins. Use agent-level permissions to narrow a worker's tools and resources. For example, a reviewer should not be able to edit, while an implementation worker may have only the shell commands needed for bounded tests.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "agents": {
    "reviewer": {
      "description": "Reviews changes without editing",
      "mode": "subagent",
      "permissions": [
        { "action": "edit", "resource": "*", "effect": "deny" }
      ]
    }
  }
}
```

Permissions are not a substitute for a narrow assignment. Shell tools run with the host user's authority, and a subagent uses its own configured permissions rather than inheriting a restricted subset of its parent. Test the actual rules in the environment where the agent will run; do not assume a prompt is a security boundary.

## Separate project configuration from CLI preferences

Use project or global `opencode.json` / `opencode.jsonc` for agents, models, permissions, skills, and other OpenCode configuration. CLI and TUI preferences have a separate `cli.json` configuration. Do not mix terminal appearance or keybindings into project agent configuration.

## Reference the V2 docs

- [Agents](https://opencode.ai/v2/docs/agents)
- [Configuration](https://opencode.ai/v2/docs/config)
- [Permissions](https://opencode.ai/v2/docs/permissions)
- [Instructions](https://opencode.ai/v2/docs/instructions)
- [Skills](https://opencode.ai/v2/docs/skills)
- [Commands](https://opencode.ai/v2/docs/commands)
- [CLI](https://opencode.ai/v2/docs/cli)
