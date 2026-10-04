# Agentic Approach — Claude Code entry

@AGENTS.md

## Claude Code notes
- Project instructions live in `AGENTS.md` (imported above). Keep it the single source; do not fork the rules here.
- Subagents are defined in `.claude/agents/`; their **models are single-sourced** in `.opencode/models.json`
  and synced by `scripts/sync-agent-models.mjs` (`--check` runs in CI). Do not edit a `model:` line by hand.
- The `pr-reviewer` role reviews a diff against `docs/standards/review-checklist.md` and is swappable with a
  human reviewer; it has no write access and no authority to approve.
