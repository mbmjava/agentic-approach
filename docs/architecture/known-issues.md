---
title: Known issues
type: architecture
status: active
owner: mbmjava
last_updated: 2026-10-04
tags: [architecture, known-issues]
---

# Known issues

Durable, accepted limitations that are not worth fixing yet. Each entry has a summary row and a detail
block with a matching `K<n>` id. `scripts/check-docs.mjs` enforces that ids are unique and that every
summary row has a detail block (and vice versa).

Delete an entry when it is resolved; do not keep a body for a superseded item.

## Summary

| ID | Title | Status | Opened |
| --- | --- | --- | --- |
| K1 | Example: browser path is not covered by CI | open | 2026-10-04 |
| K2 | Example: wrapper timeout is fixed, not adaptive | accepted | 2026-10-04 |

## Details

### K1 — Example: browser path is not covered by CI
**Status:** open · **Opened:** 2026-10-04

The example API is covered by unit tests, but the browser path is only checked manually. Accepted for
now; add a headless browser check when the UI stabilizes.

*(Example entry — replace or delete.)*

### K2 — Example: wrapper timeout is fixed, not adaptive
**Status:** accepted · **Opened:** 2026-10-04

Wrappers use a fixed timeout, so a slow-but-healthy command can be killed. Accepted because a hang is
worse than a re-run; revisit if it recurs.

*(Example entry — replace or delete.)*
