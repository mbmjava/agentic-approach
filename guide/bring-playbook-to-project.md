# Bring the playbook into a project

This playbook is meant to be consumed, not just read. A target project can use it in three ways, from lightest to heaviest. Start light; copy more only when it earns its place.

## Consumption modes

| Mode | What it means | Use when |
| --- | --- | --- |
| **Reference** | The project's agent reads the guide (as a path or URL) and adapts the advice in place. Nothing is copied. | Assessing or refactoring an existing setup. |
| **Copy** | Copy the templates and contracts the project needs into the project's own files. | A project wants durable plan/handoff/audit/template files. |
| **Install** | Turn reusable contracts into the project's agent assets: skills, agents, commands, wrappers, and checks. | The same procedures repeat across sessions. |

These compose: reference first, copy what you keep, install what repeats.

## How to pull it in

### As a reference (nothing copied)
1. Make the guide readable by the target session: a local path, a Git clone, or a published URL.
2. Grant **read-only** access; never write back into the playbook from a target project.
3. Use the [target-project prompt](llm-setup-and-refactor.md) so the agent inspects the target, proposes a plan, and waits for approval.

This is the safest mode: no forked guidance to drift. It is enough for an assessment or a one-off refactor.

### Copy the templates
Copy the [reusable templates](templates.md) into the project and adjust paths:

| Guide artifact | Lands in the project as |
| --- | --- |
| Project instruction entry (`AGENTS.md` / `CLAUDE.md`) | is the project's own instruction file (see the adapters) |
| Working agreement | a short `AGENTS.md` plus a living agreement doc ([working agreement](working-agreement.md)) |
| Living plan | the project's plan location (e.g. `working-docs/plans/`) |
| Handoff | one canonical handoff path per active workstream |
| Decision record | the project's ADR directory |
| Known-issues entry | the project's durable register |
| Enforcement & cleanup audit | filled in per project, kept with working docs |
| Evaluation harness | beside the feature it measures |
| Wrapper specs | a requirements file the project implements in its own stack |

Keep one canonical copy per project; link to central standards rather than forking their meaning ([documentation bloat](documentation-bloat.md)).

### Install the repeating parts
Turn contracts you keep reusing into agent assets:

| Guide artifact | Installs as |
| --- | --- |
| Assignment brief + “return findings only” | a documented assignment skill (see [safe delegation](delegate-safely.md)) |
| Handoff prep, spec generation, visual inspection, eval run | [skills](agentic-coding-template.md) |
| Docs/link check, generated-index check, bounded test/server wrappers | scripts the project implements from [reference wrappers](reference-wrappers.md), wired into instructions and CI |
| Reviewer / worker roles | agent definitions in the CLI's adapter ([OpenCode](configure-opencode.md) or [Claude Code](claude-code-setup.md)) |

## Steps for a new or existing project

1. **Read** the [bootstrap checklist](bootstrap-checklist.md) (new) or the [adopt/refactor](adopt-or-refactor.md) path (existing).
2. **Reference** the guide from the target session and run the [assessment prompt](llm-setup-and-refactor.md) read-only.
3. **Approve** a bounded plan; implement one item at a time, ending green.
4. **Copy** only the templates the project will maintain.
5. **Install** wrappers and checks, proving each with its acceptance test—including the failure path.
6. **Record** what you adopted and any local deviation, with a reason.

## Rules for pulling the playbook in

- **Do not copy code or config verbatim.** Wrapper specs and examples are shapes to implement, not files to import; adaptation is the point.
- **Pin a version.** If you clone or vendor the guide, record which revision you validated against so “the standard changed underneath us” is visible.
- **Keep the source single.** The guide is the reference; the project holds its own adapted files. Don’t maintain a second, diverging copy of the guide.
- **Review harness changes.** Everything you install—instructions, skills, permissions, wrappers, CI—is code under change control ([harness as code](anti-patterns.md)).
- **Delete what you don’t use.** A copied template you never fill in is noise; remove it.

## Publishing and sharing the guide

The guide is plain GitHub-flavored Markdown with relative links. It renders directly on GitHub or GitLab, and any agent can read a single file or the whole repository without a build step. For reference mode, point a target session at the repository URL or a local clone; keep its access read-only.

If you want a hosted site, generate it from the same Markdown with a static-site tool (MkDocs Material, Docusaurus, VitePress, or Starlight). The Markdown stays the source of truth and the renderer is a swappable adapter. Commit the generator's config, but never fork the content into a second copy.

## Use this repository as a starting point

The `app/` directory is a complete, self-contained starter: the harness (`.opencode/`, `.claude/`, `scripts/`, `docs/`, `working-docs/`, `tools/`, `.github/`) and a blank Maven + React app, wired and verified together. Copy `app/` into a new project — or use this repository as a template — and you get the workflow, checks, and CI already in place; this playbook is the reference it points back to.

See [Use the playbook from the target project](llm-setup-and-refactor.md) for the read-only access rules.
