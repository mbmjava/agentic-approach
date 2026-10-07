---
title: Known issues
type: architecture
status: active
owner: mbmjava
last_updated: 2026-10-05
tags: [architecture, known-issues]
---

# Known issues

Durable, accepted limitations and deferred work that outlive the current task. Each entry has a
summary row and a detail block with a matching `K<n>` id. The docs check validates required fields and
that the summary agrees with its detail block.

Use the next ID after the highest ever assigned; never reuse or renumber an ID. Gaps are expected after
fixed entries are deleted. Status values are project-defined; use one vocabulary consistently. Delete
an entry when it is fixed; Git history is the record.

Every detail block includes `Status`, `Severity`, `Owner`, `Opened`, `Target`, `Impact`, `Where`,
`Trigger`, and `Next`. Severity is `low`, `medium`, or `high`.

## Summary

| ID | Title | Status | Severity | Owner | Target |
| --- | --- | --- | --- | --- | --- |
| K1 | Example: browser path is not covered by CI | open | low | Maintainer | when UI stabilizes |
| K2 | Example: wrapper timeout is fixed, not adaptive | accepted | low | Maintainer | none |

## Details

### K1 — Example: browser path is not covered by CI
- **Status:** open · **Severity:** low · **Owner:** Maintainer · **Opened:** 2026-10-05 · **Target:** when UI stabilizes

- **Impact:** Browser regressions may reach users without CI detection.
- **Where:** frontend browser workflow
- **Trigger:** A UI interaction changes without a browser check.
- **Next:** Add a headless browser check when the UI stabilizes.

*(Example entry — replace or delete.)*

### K2 — Example: wrapper timeout is fixed, not adaptive
- **Status:** accepted · **Severity:** low · **Owner:** Maintainer · **Opened:** 2026-10-05 · **Target:** none

- **Impact:** A slow-but-healthy command can be stopped at the fixed timeout.
- **Where:** scripts/worker-verify.mjs
- **Trigger:** A healthy build repeatedly exceeds the timeout.
- **Next:** Revisit the timeout if this recurs.

*(Example entry — replace or delete.)*
