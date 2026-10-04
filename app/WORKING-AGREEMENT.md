# Working agreement

Owner: <you> · Last reviewed: YYYY-MM-DD

The living agreement for maintaining this project. It is policy for the maintainers and agents, not
part of the product; [`AGENTS.md`](AGENTS.md) points here.

## Scope

- **Owned:** this application and its agent harness.
- **Source of truth:** the code, the tests, and the living plan.
- **Out of bounds for now:** secrets/PII hardening, and anything not needed for the current wave.

## Roles

- The maintainer owns intent, the agreement, and final acceptance.
- A contributing agent works from `AGENTS.md` + this agreement, keeps changes bounded and reviewable,
  and reports what changed, what was verified, and what was not.

## Non-negotiables

1. **Experience-first.** Add concrete lessons (failure modes, contracts, specifics) over restated consensus.
2. **Anti-bloat.** One canonical home per subject; link instead of duplicating; delete or supersede stale text.
3. **Tool-neutral core.** Shared guidance stays CLI-independent; OpenCode/Claude specifics stay in their adapters.
4. **Evidence with limits.** Estimates, prices, and results are dated and labelled verified vs assumed.
5. **Links stay valid.** Every local link resolves; the link check is clean.
6. **Change log updated** when meaning changes.
7. **Harness is code.** Instructions, agents, skills, permissions, and wrappers get the same scrutiny as code.

## Definition of done

- Checks green: `node scripts/check-docs.mjs`, `node scripts/check-harness-parity.mjs`,
  `node scripts/sync-agent-models.mjs --check`, `./mvnw test`, and the frontend `lint`/`typecheck`/`test`/`build`.
- Claims carry evidence and limits; no secret values anywhere.

## Verification

- **Checks:** `node scripts/check-docs.mjs`; `node scripts/check-harness-parity.mjs`;
  `node scripts/sync-agent-models.mjs --check`.
- **App:** `node scripts/worker-verify.mjs`; frontend `npm ci && npm run lint && npm run typecheck && npm run test && npm run build`.
- **Never:** commit generated output, logs, or secrets.

## Cleanup

- Supersede or delete stale text rather than stacking a second copy.

## Change log

- YYYY-MM-DD — Created.
