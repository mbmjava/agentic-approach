# Prevent documentation bloat

Agentic coding makes documentation bloat easy: models produce plausible prose quickly, and every session can add “helpful” notes. Left unchecked, docs grow faster than the code they describe and start to contradict it. Bloat is not harmless—stale or competing guidance costs tokens, misleads both agents and humans, and erodes trust in the docs that are still true.

The governing rule is simple: **docs reflect reality or they don't exist.** A doc that contradicts the code or a fresher doc is deleted or superseded, not paraphrased into a third copy.

## Give every doc a purpose and a lifespan

Before writing, answer three questions:

1. **Who reads this, and when?** If no one, don't write it.
2. **What makes it true?** Code, a test, a generated artifact, or a human decision. If nothing keeps it true, it will drift.
3. **When should it be deleted?** Superseded, merged, or made obsolete.

Prefer editing an existing canonical doc over creating a new one. “One canonical page per subject” is the default; a second copy is a future contradiction.

## Separate the kinds of docs, and keep each kind small

| Kind | Keep it small by |
| --- | --- |
| Project instructions (`AGENTS.md`, `CLAUDE.md`) | Only always-relevant rules; link to detail instead of inlining it; cap the file length and treat growth as a warning. |
| Durable docs (architecture, decisions, runbooks) | One canonical page per subject with an owner; update with the behavior change. |
| Living plans and handoffs | Refresh in place; never accumulate a second handoff for the same workstream. |
| Scratch notes and experiment logs | Keep out of the canonical set; they never become policy without deliberate promotion. |
| Generated output (code maps, reports) | Do not hand-edit; regenerate and mark as generated. |

## Keep instructions lean

- **Think in budgets.** A short attention budget for always-loaded instructions, and a soft cap on the number of canonical docs. When you approach it, delete before you add.
- **Don't restate standards.** Link to the central standards source; put only the version/path and genuine local deviations in the project entry point.
- **Don't duplicate across layers.** A worker prompt, a skill, and an instruction file should not repeat the same rules; each should point to the one canonical source.
- **Prefer the source of truth to prose.** A passing test, schema, or generated map beats a paragraph describing the same thing.

## Delete aggressively, deliberately

- **Supersede, don't stack.** When a doc is replaced, delete it or leave a one-line `SUPERSEDED BY <path>`—never two live copies.
- **Delete stale, don't paraphrase.** If a note contradicts a fresher one, remove it in the same change.
- **Fix docs in the same commit as the behavior change.** Separate “docs later” changes are where drift begins.
- **Remove narration.** Comments and docs explain *why*, not what the code already says.
- **Delete TODO docs.** A doc whose only content is “to be written” is noise; keep the task in the plan instead.

## Guard against agent-created bloat

- **No new doc without a reason.** Require the purpose/lifespan answers above before an agent creates a page.
- **Prefer editing over adding.** Tell workers to update the canonical doc rather than start a new one.
- **Review docs like code.** Documentation changes go through the same diff review as behavior changes; an agent should not silently expand the canonical set.
- **Cap agent output for docs.** Ask for the smallest edit that makes the doc true—not a rewrite.

## Keep it true over time

- **Frontmatter and status.** A small schema (`title`, `type`, `status`, `owner`, `last_updated`) makes staleness visible and lets a check flag drift.
- **One check, not many.** A single script/CI step that validates metadata and relative links catches most decay cheaply.
- **Periodic prune.** On a cadence, list the canonical docs, mark each keep/update/delete, and act. Deleting is a valid outcome.
- **Measure lightly.** Track the count of canonical docs, the number past their review window, and orphaned pages (no inbound links). Growth without a matching need is the signal.

## Apply this to the playbook itself

This guide is not exempt. Keep topics focused, avoid restating the same rule in multiple places, update the [change log](playbook.md) rather than forking meaning, and delete a topic that has stopped earning its place. A playbook that bloats past usefulness has failed the same way a stale runbook has.

See [Preserve context](preserve-context.md) for the documentation lifecycle and [Reusable templates](templates.md) for the frontmatter-bearing skeletons.
