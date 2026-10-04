# Agentic Approach

A living playbook for agentic coding — plus a ready-to-use agent harness and a blank Maven + React app
you can start a real project from.

The playbook extracts what actually works in real projects, generalizes it, and ships the reusable parts,
so a new project starts with the workflow, agents, checks, and CI already wired instead of assembling them
by hand.

## Start here

- **New to agentic coding:** [What this is](guide/what-this-is.md) → [Playbook](guide/playbook.md) →
  [Roles](guide/agentic-workflow.md) → [Safe delegation](guide/delegate-safely.md).
- **Setting up a project:** [Bootstrap checklist](guide/bootstrap-checklist.md),
  [working agreement](guide/working-agreement.md), [template](guide/agentic-coding-template.md), and an
  adapter ([OpenCode](guide/configure-opencode.md) or [Claude Code](guide/claude-code-setup.md)).
- **Starting from this repo:** click **Use this template**, or copy `app/` and the harness you want. See
  [Bring the playbook into a project](guide/bring-playbook-to-project.md).
- **Full topic index:** [guide/README.md](guide/README.md).

## What's in here

| Path | What it is |
| --- | --- |
| `guide/` | the playbook — plain GitHub-flavored Markdown with relative links |
| `app/` | a blank Maven + React app with the harness already wired and verified |
| `.opencode/`, `.claude/`, `CLAUDE.md` | the agent harness for both CLIs (shared bodies, per-CLI frontmatter) |
| `scripts/` | verification and hygiene scripts (docs, links, harness parity, model sync, wrappers) |
| `docs/` | standards, reusable templates, and the known-issues register |
| `working-docs/` | agent standards, the current handoff, plans, and the wave log |
| `tools/` | the PR-review flow (provider-native gate + n8n advisor) |
| `.github/` | CI, the PR template, and CODEOWNERS |

## How the guide stays real

Every claim is either a tested lesson or is labelled with its limits (dated estimates, prices, results).
The playbook follows the practice, not the other way around. See [What this is](guide/what-this-is.md) and
the [working agreement](guide/working-agreement.md).

## Status and limits

This is an evolving, opinionated baseline, not a compliance framework. Security/PII hardening is not
covered yet. Examples are shapes to adapt to your stack, not files to copy verbatim.

## License

Apache-2.0. See [LICENSE](LICENSE).
