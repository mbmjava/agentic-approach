# Preserve context across sessions

A session accumulates more than decisions: it also develops working understanding—why a boundary exists, which options were rejected, what “good enough” means, and which assumptions have been tested. A fresh session does not automatically inherit that tacit layer. Preserve the parts that change the next decision, not a transcript of everything that happened.

Good context management also makes work **recoverable after an unexpected interruption**. Conversation history can help, but the recoverable state must live in files and observable project state—not only in the running session.

## Use a plan and a handoff for different jobs

- A **living plan** tracks current state, evidence relevant to the next decision, unresolved questions, and the exact next action.
- A **handoff** is a concise point-in-time snapshot for a controlled session change. It records what is proven, what is not verified, active processes or state, gotchas, constraints, and where to resume.
- **Durable documentation** records stable process, architecture, and decisions that future work should rely on.
- **Scratch notes** are useful during exploration, but do not become policy until their claims are checked and deliberately promoted.

Do not make a handoff the only home for a lasting decision or known issue. Handoffs are refreshed; durable knowledge must survive them.

Keep this lightweight: a one-file fix usually needs no plan or handoff. Capture context when there is enough state, rationale, or pending work that a fresh session would otherwise repeat meaningful investigation.

Tagwell's concrete split is `docs/` for reviewed, durable knowledge and `working-docs/` for plans, handoffs, and current work state. Its handoff is a snapshot; the plan is kept resumable. That split is one good implementation, not a required directory naming scheme.

The distinction matters during a crash: a handoff is mainly a planned checkpoint, while the living plan must stay current enough to recover if the session stops before a handoff is prepared. Tagwell's practice of updating the plan with the latest outcome, relevant evidence, blocker, and next action before proceeding helps limit how much state can be lost.

## Keep a simple documentation lifecycle

Tagwell adds several useful practices around that split. Adapt the directory names and ceremony to the project, but keep the underlying sources of truth distinct:

| Document | Purpose | Keep it current by |
| --- | --- | --- |
| Project instructions (`AGENTS.md`, `CLAUDE.md`, or equivalent) | Short, always-relevant workflow and repository guidance | Link to longer standards; remove stale or conflicting rules. |
| Durable documentation | Architecture, product behavior, team conventions, and operating procedures | Update it with the behavior change; keep one canonical page for each subject. |
| Living plan | Current state, evidence, unresolved decision, exact next step | Keep it in the shared/versioned project and refresh it as work proceeds, especially before long or risky actions. |
| Handoff | Compact recovery snapshot for the active workstream | Keep one canonical handoff per workstream; replace it at a new checkpoint and point to the living plan. |
| Decision record | Rationale and consequences of a hard-to-reverse choice | Write it when the choice is made; do not leave the decision only in a plan or chat. |
| Known-issues register | Accepted limitations and deferred work that outlive the current task | Track them durably with an owner or trigger; do not rely on a refreshed handoff to preserve them. |

Tagwell also uses a documentation index to find canonical pages and templates for plans, handoffs, and decisions. For governed Markdown, it requires a small frontmatter schema (`title`, `type`, `status`, `owner`, `last_updated`, with optional `tags`) and checks that metadata and relative links resolve in a script/CI. Stale copies are removed or pointed to their replacement rather than left as competing guidance. These are lightweight ways to keep a developer's working memory trustworthy; adopt them when the docs volume justifies the small maintenance cost.

Copy-ready skeletons for the plan, handoff, decision record, and known-issues entry are in [Reusable templates](templates.md).

### Keep the known-issues register tracker-shaped

Accepted limitations and deferred work belong in a **durable register**, never only in a handoff (handoffs are refreshed and superseded). Make it tracker-shaped so it can be imported into a real issue tracker later without rework:

- **Stable ids** — `K<n>`, unique and sequential; never reuse or renumber. The id is the durable reference tied to in-code comments and plans.
- **A fixed schema per entry** — e.g. `Status` · `Severity` · `Owner` · `Opened` · `Target` · `Impact` · `Where` · `Trigger` · `Next`. Every entry fills every field (use `n/a`), so nothing is silently missing.
- **Summary table and detail blocks stay in sync** — one row per id, one `### K<n>` block; the two must agree.
- **Delete when fixed** (Git is the record), rather than paraphrasing to “resolved.” A lingering resolved entry is noise.
- **Enforce the schema in the docs check** — unique, sequential ids and summary/detail agreement — so the register cannot rot silently.
- **Route newly evidenced risks here, not only to the handoff.** A risk found during a review or migration goes into the register with its `Trigger`; the handoff links it.

The consistent format is the point: it lets the register survive sessions and later become tickets without translation.

A lifecycle alone does not stop sprawl, though. For how to keep the doc set small and true—budgets, deletion triggers, and guarding against agent-created bloat—see [Prevent documentation bloat](documentation-bloat.md).

## Cold-start procedure

1. Read the repository's `AGENTS.md` and any applicable nested instructions.
2. Read the current handoff as a snapshot.
3. Read the living plan for the current state and next action.
4. Confirm that the working tree, processes, and environment still match the notes.
5. Continue only after reconciling stale or conflicting state.

Treat the previous conversation as helpful history, not as proof that the current filesystem still matches it.

## Make recovery checkpoints real

- Before a long, risky, or non-idempotent operation, record the last verified state, what is about to run, its expected effects, and how to tell whether it completed.
- After a meaningful result, update the plan with evidence and the next action before starting another expensive or state-changing step.
- Keep work in small slices that can be inspected and verified independently. Where the team's Git policy allows it, a clean verified commit can be a durable checkpoint; otherwise record the uncommitted file state clearly.
- Record process IDs or reliable service identifiers, log paths, and whether a process is expected to still be running. Do not treat an old log marker as proof that a process completed.
- On recovery, inspect the working tree and running processes before retrying. If completion is uncertain, determine whether the operation is idempotent and inspect its side effects first.
- Separate verified facts from assumptions and not-yet-verified work. A crash must not turn “probably passed” into “green.”

No handoff scheme can recover unpersisted work or guarantee machine-level durability. The goal is to make the last persisted checkpoint clear and the next action safe to repeat or verify.

## What a useful handoff carries forward

Keep it short enough to use, but preserve decision-relevant context:

- Goal, scope, and what “done” means.
- Verified evidence and what was **not verified**.
- Why the current direction was chosen, plus any rejected option that should not be rediscovered.
- Stable user preferences that affect the work—such as desired scope, interaction style, or design taste—and the rationale when it matters.
- Constraints, accepted risks, and hard-won facts.
- Current branch/working-tree state and relevant running processes.
- One coherent next action and the files to read first.

The rationale matters because a new session otherwise spends time re-deriving intent. Prefer a few accurate sentences linked to the plan over a long raw transcript.

## Choose a reset point based on the work

Close or refresh a handoff at a milestone, before a deliberate context reset, when a session stalls, or when the current context has become difficult to navigate. A time limit can be a useful local reminder, but it is not a universal measure of context quality.

Tagwell additionally uses a local “answer before act” rule: a question or observation is not automatically a work order. In a general workflow, preserve the same intent by distinguishing an explicit request from a discussion, and ask before expanding ambiguous scope or crossing an agreed risk boundary.

If the next step depends on a human decision, stop at that decision. Record the evidence and alternatives, then ask; do not keep editing or running expensive evaluations just to maintain momentum.
