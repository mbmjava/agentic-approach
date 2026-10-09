---
title: Handoff — spec-first approval commands
type: handoff
status: active
owner: mbmjava
last_updated: 2026-10-08
tags: [handoff]
---

# Handoff — spec-first approval commands (2026-10-08)

Branch: `feat/spec-first-approval-commands` · Working tree: uncommitted changes (most were staged before the latest fixes; some files now have both staged and unstaged edits)

**State of play (one line):** Guide and starter changes port Tagwell's discussion/formalizer and spec-time authority pattern; fixes were added for missing targets, stale spec SHA, and PR retargeting before merge.

## Read first

1. `AGENTS.md` → `working-docs/agent-standards.md`
2. [`docs/requirements/approval-mode-auto-merge.md`](../docs/requirements/approval-mode-auto-merge.md) — draft, owner-selected `approval_mode: human`
3. [`docs/runbooks/approval-loop.md`](../docs/runbooks/approval-loop.md)
4. this handoff

## Verified green

- `node scripts/check-docs.mjs` — OK.
- `node scripts/check-harness-parity.mjs` — OK (6 agents, 11 skills, 6 commands in each harness).
- `node scripts/sync-agent-models.mjs --check` — OK.
- `node --test scripts/agentic/*.test.mjs scripts/agentic/forge/*.test.mjs` — 48 passed.
- `node scripts/check-guide-links.mjs` — OK; `git diff --check` and `git diff --cached --check` — clean.
- Earlier in this round: site `npm run build` passed; site was not changed by the latest fixes.
- **NOT verified:** Maven/frontend checks were not rerun; provider-native judge enforcement is not implemented. GitHub's merge API binds the head SHA but not the target ref atomically; apply re-reads target/head immediately before merge, so native protections remain essential.

## Commits

- No commits created.

## In progress / running

- No background processes or temporary state.

## Next (ordered queue)

1. Review current staged and unstaged diffs (`git status --short --branch`, `git diff`, `git diff --cached`); keep Tagwell untouched.
2. Re-run the targeted app and guide checks after any edits.
3. Review the draft requirement's scope/open decisions; keep it `draft` until approved. Do not commit/push unless requested.

Stop conditions: needed decision / scope change / destructive action / failed verification / end of queue.
Continue through the queue; end each turn with the next action or the blocker.

## Gotchas

- Approval mode for `AGENTIC-APPROVAL-001` was explicitly selected as `human`; the requirement remains draft.
- `.agentic/config.json` intentionally has `judgeMergeTargets: []`; no branch is judge-eligible by default.
- The bootstrap change is human-authorized because preflight cannot validate itself from trusted `main` before merge.
- Judge remains manually launched; no CI judge status is wired or required by provider branch protection.
- Tagwell stayed read-only; preserve its three unrelated modified S6 test files.

## Constraints

- The orchestrator owns git; workers are read-only for git.
- No secrets in the repo; keep them runtime-only.
