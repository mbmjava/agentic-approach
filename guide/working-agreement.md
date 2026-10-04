# Working agreement

A **working agreement** is how a person and their agents agree to work in one repository: scope, roles, non-negotiables, how changes are verified, and how to add or delete things. It is a **living document**—updated as the team learns—not a one-time setup file.

It is distinct from three neighbours:

| Document | Answers |
| --- | --- |
| Project instructions (`AGENTS.md` / `CLAUDE.md`) | The facts and rules an agent needs every session. Short, and points to the rest. |
| Code/style standards (central) | How code should look and behave. Shared across repos. |
| **Working agreement** | How this repo works: who owns what, what must happen before a change lands, and what we refuse to do. |

## Why keep it separate and living

- **It changes faster than code standards.** You learn a better rule after a bad week; the agreement should absorb that.
- **It keeps the always-loaded file short.** `AGENTS.md` stays a thin entry point and links here, so context cost stays low ([documentation bloat](documentation-bloat.md)).
- **It makes rules findable and reviewable.** A single home beats a rule scattered across handoffs and chat.
- **It exposes enforcement.** Each non-negotiable should name how it is checked; a rule with no mechanism is guidance ([enforcement and cleanup](enforcement-and-cleanup.md)).

## What it contains

Keep it to what actually governs work:

- **Scope** — what this repo is responsible for, and what is out of bounds.
- **Roles and ownership** — who decides, who integrates, who owns which artifacts.
- **Non-negotiables** — the few rules that matter most, each with its enforcement level.
- **Definition of done** — what must be true before a change lands (checks, docs, review).
- **How to add or change things** — the expected path for a new topic, module, or decision.
- **Verification** — the exact commands and what they prove; what is never run.
- **Cleanup and lifecycle** — how stale things are superseded or deleted.
- **Change log** — a dated line whenever the agreement meaningfully changes, plus an owner.

## Template

```md
# <project> — working agreement

Owner: <name> · Last reviewed: <YYYY-MM-DD>

## Scope
<what this repo owns; what is out of bounds>

## Roles
- <who decides / integrates / owns which artifact>

## Non-negotiables
1. <rule> — enforced by: <permission / check / CI / review>
2. ...

## Definition of done
- <build>, <focused test>, <lint/static analysis>, <docs>, <review>

## How to add or change things
- <the path for a new <topic/module/decision>, and who approves it>

## Verification
- <exact command(s)> — proves <what>; never <what>

## Cleanup
- <supersede/delete rule>; <cadence>

## Change log
- <YYYY-MM-DD> — <what changed>
```

## Inline or split

- **Small project:** put the whole agreement in `AGENTS.md`. One file is enough.
- **Growing project:** keep `AGENTS.md` short and point to a living `WORKING-AGREEMENT.md` (or equivalent). Split when the policy outgrows one screen and is referenced often.

Either way, one canonical copy. A working agreement that contradicts the bundled instructions is worse than none.

## Keep it true

Review it when a rule is broken or a session ends badly; that is the signal that the agreement (or its enforcement) is missing something. Treat changes to it as code changes: reviewed, dated, and recorded. Delete a section that no longer earns its place.

See [Adopt or refactor](adopt-or-refactor.md) for turning stated rules into checks, and [Reusable templates](templates.md) for the other skeletons.
