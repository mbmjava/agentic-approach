# agentic-approach — working agreement

Owner: mbmjava · Last reviewed: 2026-10-04

The living agreement for maintaining this repo. It is policy for the maintainers and agents, not part
of the published playbook; [`AGENTS.md`](AGENTS.md) points here.

## Scope

- **Owned:** a tool-neutral playbook for agentic coding, published as GitHub-flavored Markdown, plus a
  reusable agent harness and a blank Maven + React starter that consumes it.
- **Source of truth:** the playbook extracts durable, tested lessons from real projects. Adapt them;
  never import another project's code or config verbatim.
- **Out of bounds for now:** secrets/PII hardening, and any language/framework-specific implementation
  beyond the reference starter.

## Roles

- The maintainer owns intent, the agreement, and final acceptance.
- A contributing agent works from `AGENTS.md` + this agreement, keeps changes bounded and reviewable,
  and reports what changed, what was verified, and what was not.

## Non-negotiables

1. **Experience-first.** Add concrete lessons (failure modes, contracts, specifics) over restated consensus.
2. **Anti-bloat.** One canonical home per subject; link instead of duplicating; delete or supersede stale text.
3. **Tool-neutral core.** Shared guidance stays CLI-independent; OpenCode/Claude specifics stay in their adapters.
4. **Evidence with limits.** Estimates, prices, and results are dated and labelled verified vs assumed.
5. **TOC and links stay valid.** Every topic is reachable; every local link resolves; the link check is clean.
6. **Change log updated** when the meaning of the guide changes.
7. **No verbatim copies** of another project's code or config.
8. **Harness is code.** Instructions, agents, skills, permissions, and wrappers get the same scrutiny as code.

## Definition of done

- The new/changed topic is linked from the guide index and every local link resolves.
- The checks are green: `check-docs`, `check-harness-parity`, `sync-agent-models --check`, `mvn test`,
  and the frontend `lint`/`test`/`build`.
- Claims carry evidence and limits; no secret values anywhere.
- Change log updated if meaning changed.

## How to add or change a topic

1. Write the topic under `guide/` in the guide's voice (experience-first, concise).
2. Link it from `guide/README.md` (and the reading path in `guide/playbook.md` where relevant).
3. Validate local links, then run the checks.
4. Update the change log in `guide/playbook.md`.
5. Prefer editing an existing topic over creating a new one.

## Verification

- **Checks:** `node scripts/check-docs.mjs`, `node scripts/check-harness-parity.mjs`,
  `node scripts/sync-agent-models.mjs --check`.
- **App:** `node scripts/worker-verify.mjs app`; frontend `npm ci && npm run lint && npm run test && npm run build`.
- **Never:** commit generated output, logs, or secrets.

## Cleanup

- Supersede or delete stale text rather than stacking a second copy.
- Keep the topic count justified; fold a topic away when it stops earning its place.

## Change log

- 2026-10-04 — Created as the productized, GitHub-hosted home of the playbook and its harness.
