# Approval authority (who approves a change)

[Independent review](independent-review.md) gives you a *reviewer*. This topic adds the two things that
turn review into **trusted approval**: a **policy** for who may approve a change, and a **fail-closed
decision** that merges only when everything agrees. Keep both **forge- and harness-neutral** so the same
rules work on GitHub or GitLab, driven by an agent or a human.

## The policy: approval authority

Who approves should be a rule, not a judgement call in the moment. Put it in one file
(`.agentic/config.json`) and resolve a change to a single **authority** by a fixed precedence:

1. **Hold** — an explicit hold label wins over everything → human.
2. **Risk path** — a change touching a protected area → human (see below).
3. **Explicit label** — `approve:human` beats `approve:model` when both are present.
4. **Default** — `approval.default` (start at `model`).

Risk paths are the point of the policy: paths where an automated approval is never acceptable —
security, tenancy, schema/migration, CI workflows, and **the loop's own files** (the harness, the policy,
the standards). A change that touches any of them is **human**, no matter what label it carries. This keeps
the loop from ever widening its own authority.

Keep the labels **neutral** (`approve:model` / `approve:human` / `approve:hold`) and remap them per forge
(e.g. GitLab scoped labels) in the adapter, so the policy file never names a provider.

## The decision: fail closed

A single pure function decides the action from three inputs — **authority**, **CI state**, and the
**judge verdict**:

```
merge   only when  authority = model  AND  ci = pass  AND  judge = approve
human   when authority = human
escalate otherwise (non-approve judge, non-green CI, missing/invalid input)
```

Two guards make it safe to run for real:

- **Bind the merge to the judged revision.** Pass the reviewed head SHA through to the merge call, and
  refuse if the head moved — otherwise a push between review and merge ships an unjudged revision.
- **Check the target branch.** Merging into the wrong base is silently destructive; assert the base equals
  the configured rollup branch.

The merge is an **actuator**, not the gate. Prefer making the **provider** the gate (branch protection /
required checks, including the judge status) so a change *cannot* merge without them; the loop then only
merges when it is additionally allowed to.

## Two roles, not one

The reviewer **finds** problems; the **judge** decides, adversarially, whether the change is safe to
approve — re-reading the risky parts, refuting false positives with cited rationale, and confirming the
acceptance criteria. They are separate read-only agents with separate outputs, so a single model's optimism
cannot both write and bless a change. Both are subagents launched in a fresh context; a human can take
either seat later behind the same contract.

## Calibrate before you trust it

An advisory judge becomes a gate only after it has been measured on **real, correctly-labelled PR heads** —
not a hand-written synthetic corpus, which can read perfectly and miss real defects:

- Label each case with the verdict the review record **actually required at that head**, and record the
  policy's resolved `authority`.
- The headline metric is **`falseApproveRate`** — approving a change that should not merge (the dangerous
  error). Also watch false rejects.
- **Score only `authority = model` cases.** For human-gated changes the loop never consults the judge, so
  including them measures the wrong thing.
- Widen automation only when `falseApproveRate = 0` on that real corpus.

## Where this lives

A small, dependency-free reference implementation ships in the starter: `scripts/agentic/` holds the
policy (`config.mjs`), the resolver (`authority.mjs`), the decision (`decide.mjs`), the actuator
(`apply.mjs`), a forge port (`forge/`), and the calibration scorer (`calibration.mjs`); the roles are
`.opencode/agents/{pr-reviewer,judge}.md` and their `.claude/` mirrors; the runbook is
`docs/runbooks/approval-loop.md`. It is CLI- and provider-neutral — swap the forge adapter, keep the
policy and the contract.

If you already run a neutral orchestrator (e.g. [n8n](https://n8n.io)) for events, comments, and
visibility, keep it in that role — it should **call this decision**, not re-derive a verdict, so there is
one source of truth for *who may approve*.
