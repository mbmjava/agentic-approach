---
name: Generate PRD
description: Write a product requirement / spec / PRD into docs/requirements/. Use when the user asks for a PRD, requirements doc, feature spec, or API/spec document.
---

# Generate PRD

Author a durable requirements doc under `docs/requirements/`, following the documentation standard
(`docs/standards/documentation.md`).

## Steps
1. Read the template: `docs/standards/templates/requirement.md`.
2. Write `docs/requirements/<kebab-name>.md`. Use **relative Markdown links** to related docs
   (e.g. an ADR in `../decisions/NNNN-….md`); never `[[wiki-links]]`.
3. Frontmatter is required: `title, type: requirement, status: draft, owner, last_updated, tags`.
4. Keep these H2 sections, in order:
   - `## 1. Problem statement`
   - `## 2. Goals & non-goals`
   - `## 3. Scope & interfaces`
   - `## 4. Requirements` (numbered, testable)
   - `## 5. Edge cases & boundaries`
   - `## 6. Acceptance` (observable criteria; a checklist)
5. If the doc encodes a hard-to-reverse choice, also record an ADR
   (`docs/decisions/NNNN-….md`, template `docs/standards/templates/decision.md`).

## Rules
- **Requirements are testable**; no vague adjectives.
- Update the doc in the **same commit** as any behavior it describes.
- Run `node scripts/check-docs.mjs` before finishing.
