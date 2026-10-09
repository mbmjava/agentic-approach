---
title: Documentation process
type: standard
status: active
owner: mbmjava
last_updated: 2026-10-08
tags: [process, docs, onboarding]
---

# Documentation process

The team's rulebook for **what to write, where it lives, and how it stays true**. Read it
alongside `working-docs/agent-standards.md` (how agents work) and `AGENTS.md` (the auto-loaded
entry). This standard is the source of truth for documentation layout and lifecycle; if it and a
scattered note disagree, this wins and the note is fixed or deleted.

## 1. The one principle

**Docs reflect reality or they don't exist.** A doc that contradicts the code (or a fresher doc)
is **deleted, not paraphrased**. Every behavior change updates its doc in the **same commit**.

## 2. Two roots: durable vs working

| Root | Nature | Review | Examples |
| --- | --- | --- | --- |
| `docs/` | **Durable team knowledge** — stable, reviewed, for humans joining and for tooling | PR review; changes are deliberate | standards, architecture, requirements, decisions, product, runbooks, onboarding |
| `working-docs/` | **Volatile working state** — updated continuously, no review ceremony | none (keep it current) | per-wave handoffs, living plans, observability logs, agent standards |

Rule of thumb: if a new teammate should read it to *understand the system or our process*, it is
`docs/`. If it exists to *coordinate the current wave of work*, it is `working-docs/`.

## 3. Directory map

```
AGENTS.md                          # auto-loaded entry → points here
docs/
  00-index.md                      # map of content (entry point / Obsidian home)
  standards/                       # how we work (this file + templates/)
    templates/                     # copy-paste skeletons
  architecture/                    # system design, module map, invariants
  requirements/                    # PRDs, specs
  decisions/                       # ADRs: NNNN-title.md
  product/                         # user guides, FAQs
  runbooks/                        # operational procedures
  onboarding/                      # the new-member path
working-docs/
  agent-standards.md               # how agents work
  handoff.md                       # THE canonical handoff (reuse/overwrite each wave)
  plans/<name>.md                  # living plans / checklists
  observability/                   # logs and captures (not governed docs)
```

## 4. Frontmatter (required on every governed doc)

Every governed Markdown file starts with YAML frontmatter:

```yaml
---
title: Human title
type: standard            # see enum below
status: active            # draft | active | stable | superseded
owner: Mike               # one accountable person or team
last_updated: 2026-09-30  # YYYY-MM-DD, bumped when the body changes
tags: [topic, area]       # optional
---
```

| Field | Required | Values |
| --- | --- | --- |
| `title` | yes | free text |
| `type` | yes | `standard` · `architecture` · `requirement` · `decision` · `product` · `runbook` · `plan` · `handoff` · `index` |
| `status` | yes | `draft` · `active` · `stable` · `superseded` |
| `owner` | yes | one person/team |
| `last_updated` | yes | `YYYY-MM-DD` |
| `tags` | no | list |

The CI `docs-check` job enforces this. **Exempt:** `docs/standards/templates/**` and
`working-docs/observability/**`.

## 5. Naming

- kebab-case filenames; no spaces.
- ADRs: `docs/decisions/NNNN-short-title.md` (`0001-…`, zero-padded).
- Handoffs: **one** file, `working-docs/handoff.md` — reused (overwritten) at each wave boundary; no
  per-wave names, no accumulation. Sessions always resume from this stable path.
- Prefer a stable name over a dated one; put the date in `last_updated`.

## 6. Lifecycle & ownership

1. **Draft** (`status: draft`) while content is provisional.
2. **Active/Stable** once reviewed.
3. **Superseded**: either **delete** the file, or leave a one-line `SUPERSEDED BY <path>` pointer at
   the top and nothing else. Never keep two live copies.
4. A **decision that is hard to reverse** gets an ADR (`docs/decisions/`): Context → Decision →
   Consequences. The ADR is the durable record; the debate/chat that produced it is not.

## 7. Templates

Copy from `docs/standards/templates/`:

| Template | Use |
| --- | --- |
| `handoff.md` | end a wave (overwrite `working-docs/handoff.md`) |
| `plan.md` | start/extend a living plan (`working-docs/plans/`) |
| `decision.md` | an ADR (`docs/decisions/NNNN-…`) |
| `requirement.md` | a PRD/spec (`docs/requirements/`) |
| `runbook.md` | an operational procedure (`docs/runbooks/`) |

Skills encode these procedures: `prep-handoff` plus a shared `spec-base` interview and typed formalizers
(`feature`, `enhancement`, `bugfix`, `infra`, `research`), mirrored in `.opencode/skills/` and
`.claude/skills/`.

## 8. What to write when (decision tree)

- Made an **irreversible / precedent-setting choice** → ADR.
- Building a **unit of intent** → one requirement in `docs/requirements/` with `## Plan` and `## Waves`;
  its owner selects `approval_mode` during spec creation.
- Coordinating a **cross-cutting workstream spanning multiple specs** → a plan in `working-docs/plans/`.
- **Ending a workstream** (milestone, hour mark, first stall) → refresh its handoff.
- Changed **behavior/contracts** → update the matching durable doc in the same commit.
- Explaining the **system** to a newcomer → `docs/architecture/` or `docs/onboarding/`.
- Operating the system → `docs/runbooks/`.

## 9. Agents

- `AGENTS.md` stays the auto-loaded entry and **must** link to this standard.
- Agents follow the same roots: durable edits via the orchestrator's normal review; working-state
  edits (handoffs/plans) freely.
- **One canonical handoff, reused.** `working-docs/handoff.md` is overwritten at each wave boundary
  (git is the history); there are no superseded handoff stubs to accumulate.
- Delegated work still follows `working-docs/agent-standards.md` (workers never run git).

## 10. Obsidian compatibility (read layer)

The docs are plain Markdown, so the repo can be opened as an Obsidian vault with no conversion:

- Vault root = the repository; add `.obsidian/` to `.gitignore` (never commit vault state).
- Frontmatter (§4) drives tags and graph views.
- Use **relative Markdown links** (`[text](../requirements/foo.md)`), **not** `[[wiki-links]]` —
  wiki-links do not render on GitHub. The CI check fails broken relative links.
- The CI check also forbids `[[…]]` in governed docs.
- `docs/dashboard.md` holds Dataview views (open ADRs, drafts, stale docs) over this frontmatter;
  optional — the same data is greppable.

## 11. Enforcement

- **CI:** the `docs-check` job (`scripts/check-docs.mjs`) validates frontmatter and relative links
  on every PR.
- **Review:** the PR checklist includes "docs updated in the same commit?" and "no stale copy left
  behind?".
- **Agents:** `AGENTS.md` → this file is the first hop for any doc change.

## 12. Change log

- 2026-09-30 — created; root split (`docs/` durable vs `working-docs/` working), plans moved
  in-repo to `working-docs/plans/`, frontmatter + CI check adopted.
