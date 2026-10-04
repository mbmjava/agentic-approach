---
title: Static analysis
type: standard
status: active
owner: mbmjava
last_updated: 2026-10-04
tags: [quality, static-analysis]
---

# Static analysis

Three analyzers run on `verify`, **report-first** (they surface findings without failing the build),
alongside the `maven-enforcer-plugin` hygiene rules that do fail fast:

| Tool | Looks for | Config |
| --- | --- | --- |
| SpotBugs (+ FindSecBugs) | Bytecode defects (null derefs, resource leaks, bad `equals`/`hashCode`) and security smells (injection, weak crypto, path traversal) | `effort=Max`, `threshold=Medium` |
| PMD (+ CPD) | Source-level anti-slop: unused private members, empty catch, complexity, copy-paste | `bestpractices` + `errorprone` rulesets |
| Checkstyle | Style only | light ruleset in `config/checkstyle/checkstyle.xml` |

Run them with `./mvnw verify`; reports land under `target/` (`spotbugsXml.xml`, `pmd.xml`,
`checkstyle-result.xml`).

## Report-first, then gate

- Start with `failOnError`/`failOnViolation` = `false` so the analyzers surface findings without
  blocking — a noisy gate gets disabled.
- Triage the baseline. Fix real findings; **suppress the deliberate exceptions with a reason**
  (SpotBugs `excludeFilterFile`, PMD `excludeFromFailureFile`, Checkstyle `suppressions.xml`).
- Promote only the rules with a real hit rate to required: flip the relevant `failOn*` to `true`.
  Keep the set small and the failures actionable.
- Checkstyle is the lowest-value of the three; keep it light or drop it if formatting is already
  enforced elsewhere.

SonarQube (or equivalent) is the later step when you want cross-repo trends and a single quality
gate; it aggregates these tools rather than replacing them.
