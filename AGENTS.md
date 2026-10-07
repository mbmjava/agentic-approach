# agentic-approach — repo instructions

This repository holds three things:

- **`guide/`** — the playbook: a tool-neutral reference for agentic coding, extracted from real
  practice. Start at [`guide/README.md`](guide/README.md).
- **`app/`** — a **complete, self-contained starter**: a blank Maven + React app with the agent
  harness, checks, docs, templates, and CI already wired. See [`app/AGENTS.md`](app/AGENTS.md).
- **`working-docs/`** — canonical state for maintaining this playbook and starter, plus adoption
  evidence. Start at [`working-docs/README.md`](working-docs/README.md).

Work inside `app/` for anything touching the app or harness — its own `AGENTS.md`,
`WORKING-AGREEMENT.md`, and `working-docs/` govern it. Do not put app-specific state in the root
`working-docs/`, or cross-project/playbook state in `app/working-docs/`. The old
`work-approach` Writerside tree is a frozen source/archive; make current playbook changes here.

This repository's responsibility is the framework (`guide/`), starter (`app/`), and their maintenance.
Other repositories, including Tagwell, are references and sources of lessons—not standing coding
targets. Work in an external repository only when the **current user task explicitly names that target
and the specific change**. A task to apply one item does not authorize adjacent or follow-up items from
an external backlog.

This root also owns the reference playbook and repo-level checks:

- Guide links: `node scripts/check-guide-links.mjs`
- Starter checks: run from `app/` (`node scripts/check-docs.mjs`, `./mvnw test`, frontend lint/test/build).
