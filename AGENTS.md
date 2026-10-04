# agentic-approach — repo instructions

This repository holds two things:

- **`guide/`** — the playbook: a tool-neutral reference for agentic coding, extracted from real
  practice. Start at [`guide/README.md`](guide/README.md).
- **`app/`** — a **complete, self-contained starter**: a blank Maven + React app with the agent
  harness, checks, docs, templates, and CI already wired. See [`app/AGENTS.md`](app/AGENTS.md).

Work inside `app/` for anything touching the app or harness — its own `AGENTS.md`,
`WORKING-AGREEMENT.md`, and `working-docs/` govern it. This root is the reference playbook plus the
repo-level checks:

- Guide links: `node scripts/check-guide-links.mjs`
- Starter checks: run from `app/` (`node scripts/check-docs.mjs`, `./mvnw test`, frontend lint/test/build).
