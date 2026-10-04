# Enforcement and cleanup

Two things make a workflow stick: rules that are **enforced** rather than merely written, and a habit of **deleting** rather than only adding. Guidance without enforcement decays quietly, and a repo that only grows becomes hostile to humans and expensive for agents.

## Guidance is not enforcement

Distinguish the two:

- **Guidance** shapes what an agent or person does. Instructions, prompts, and conventions help only if they are followed.
- **Enforcement** constrains what can happen, regardless of intent. Permissions, checks, and required gates fail the change when a rule is broken.

Every important rule should name its enforcement level. A rule with no mechanism is a hope.

### The enforcement ladder

Use the weakest rung that reliably prevents the mistake; climb a rung when a rule keeps being broken.

| Level | Mechanism | Strength | Example |
| --- | --- | --- | --- |
| 1 | Instruction | Weak | “Workers never push to Git.” |
| 2 | Tool permission / config | Medium | Deny the `git push` action for worker agents. |
| 3 | Fast local check | Medium | A pre-commit or wrapper script that fails on a rule. |
| 4 | CI required check | Strong | A job that fails the build. |
| 5 | Branch protection | Strongest for merge | Required status checks; no direct push to main. |
| 6 | Managed/org policy | Hard to override | Central settings that a repo cannot relax. |

**Provider names (the ladder is portable).** “Required CI check” and “branch protection” mean: GitHub →
rulesets/branch protection with required status checks; GitLab → protected branches with required
pipelines and MR approval rules. The rung is the same; only the feature name differs. Put the gate in the
provider, not in a separate orchestrator (an n8n-only reviewer is advisory and cannot block a merge).

## When a required check silently doesn't run

A check that never starts is not a passing check. Two failure modes seen in the field:

- **Invalid workflow file.** GitHub rejects the whole workflow, so the run completes in **0s with no jobs**
  (it looks like a billing/quota mystery; it isn’t). The run page shows “Invalid workflow file” with the
  offending line. Validate locally with `actionlint` before pushing. Common bug: step outputs are
  `steps.<id>.outputs.*`, **not** `id.<id>...`.
- **Wrong cache/lockfile path.** `actions/setup-node` with `cache: 'npm'` looks for the lockfile at the
  repo root; a lockfile under a subpackage needs `cache-dependency-path`. The job fails at setup, before
  any test runs.

Rule: confirm a required check actually **ran and reported** on a real PR. “No checks reported” is a
failure to investigate, not a pass.

Two failure modes to avoid:

- **Enforcement theater.** A rule that reads as mandatory but has no check. Mark it as guidance instead.
- **A gate nobody requires.** CI that runs but isn’t a required check, or a slow gate people learn to bypass. Make required checks actually required and keep them fast.

### Make the failure actionable

A good check tells the person exactly what to fix and how. “FAILED” without a path, rule, and remedy trains people to ignore the check.

## Cleanup is a feature

Deletion is how a codebase and doc set stay usable. If a repo only grows, every future change costs more. Make cleanup a routine, bounded activity—not a heroic project.

### Cleanup targets

- Dead code, functions, imports, and unused dependencies.
- Superseded or stale docs, and competing copies of the same guidance ([documentation bloat](documentation-bloat.md)).
- Stale plans, handoffs, and scratch output past their use.
- Generated artifacts committed by mistake.
- Obsolete branches and abandoned worktrees.

### Detect, prevent, schedule

- **Detect.** Add lightweight signals: unused-code and unused-dependency analysis where the toolchain supports it; a staleness report from doc `last_updated`; an orphaned-page check; a generated-map freshness check. Do not hand-detective what a tool can flag.
- **Prevent.** No new doc without a reason; supersede instead of stacking; delete stale rather than paraphrase; prefer generators over hand-maintained output.
- **Schedule.** Reserve a bounded cleanup slice on a cadence, or run a cleanup checklist before a milestone. Keep each slice independently green and commit it—never leave the repo half-cleaned.

### Rules for safe cleanup

- Delete, don’t comment out. Version control is the record.
- Verify an identifier is truly unused before removing it; a dead copy of a live name has hidden bugs before.
- Keep slices small and reversible.
- Don’t “clean” a wire contract with no in-repo consumer; note it instead.

Cleanup is an ideal worker task: low judgment, an exact file list, and a check that proves nothing broke. Delegate it, serialize the checks, and let the orchestrator own the final diff and commit.

## A worked mapping (the source project example)

The source project states strong rules in its instructions and CI covers part of them. Mapping rules to levels exposes the gaps—treat this as an example, not a critique to copy:

| Rule | Started as | Enforced by | Gap |
| --- | --- | --- | --- |
| Workers never run Git writes | Instruction + agent permission | Agent permission + scope review | No CI/branch protection backstop |
| Docs have valid frontmatter and links | Instruction | Required CI `docs-check` | Enforced well |
| Builds/tests pass | Convention | Required CI backend/frontend jobs | Enforced well |
| No stale/duplicate docs | Instruction | Manual review only | No staleness or orphan check |
| No dead code / unused deps | Instruction | None | No detect tool or cadence |
| Known issues stay current | Instruction | Manual review only | No check |

The pattern: **anything CI already checks is reliably enforced; anything left to discipline drifts.** Add a mechanism to the rules that keep being broken, and schedule cleanup for the rest.

## Apply it to yourself

After a task goes badly, ask which rung would have prevented it—usually a permission, a fast check, or a required CI job—and add that. When a rule has gone a long time without a violation but also without a mechanism, either add one or stop calling it a rule. Both honesty and enforcement keep the setup trustworthy.

See [Adopt or refactor](adopt-or-refactor.md) for the audit that separates principle, policy, mechanism, and observation. To record this work, copy the [enforcement and cleanup audit template](templates.md).
