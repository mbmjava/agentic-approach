# Approval authority (who approves a change)

[Independent review](independent-review.md) gives you a *reviewer*. This topic adds the two things that
turn review into **trusted approval**: a **policy** for who may approve a change, and a **fail-closed
decision** that merges only when everything agrees. Keep both **forge- and harness-neutral** so the same
rules work on GitHub or GitLab, driven by an agent or a human.

## The policy: approval authority

Who approves should be a rule, not a judgement call in the moment. Express it as one policy with a fixed
precedence, resolving every change to a single **authority**:

1. **Hold** — an explicit hold beats everything → human.
2. **Risk path** — a change touching a protected area → human.
3. **Explicit label** — a “human” label beats a “model” label when both are present.
4. **Default** — start at **model**.

Risk paths are the point of the policy: security, tenancy, schema/migration, CI workflows, and **the loop’s
own files** (the harness, the policy, the standards). A change that touches any of them is **human**, whatever
label it carries — so the loop can never widen its own authority. Keep the labels **neutral** and remap them
per forge (e.g. GitLab scoped labels), so the policy never names a provider.

Concrete paths, labels, and the config file are the starter’s concern; see the
[approval loop runbook](../app/docs/runbooks/approval-loop.md).

## The decision: fail closed

A single pure decision from three inputs — **authority**, **CI state**, and the **judge verdict**:

```
merge   only when  authority = model  AND  ci = pass  AND  judge = approve
human   when authority = human
escalate otherwise (non-approve judge, non-green CI, missing/invalid input)
```

Two guards make it safe to run for real:

- **Bind the merge to the judged revision** — pass the reviewed head SHA through, and refuse if the head
  moved, so a push between review and merge cannot ship an unjudged revision.
- **Check the target branch** — merging into the wrong base is silently destructive; assert the base.

The merge is an **actuator**, not the gate. Prefer making the **provider** the gate (branch protection /
required checks, including the judge status) so a change *cannot* merge without them — see the
[enforcement ladder](enforcement-and-cleanup.md). The loop then merges only when it is additionally allowed to.

## Two roles, not one

The reviewer **finds** problems; the **judge** decides, adversarially, whether the change is safe to
approve — re-reading the risky parts, refuting false positives with cited rationale, and confirming the
acceptance criteria. They are separate read-only roles with separate outputs, so a single model’s optimism
cannot both write and bless a change. A human can take either seat later behind the same contract.

## Calibrate before you trust it

An advisory judge becomes a gate only after it has been measured on **real, correctly-labelled PR heads** —
not a hand-written synthetic corpus, which can read perfectly and miss real defects:

- Label each case with the verdict the review record **actually required at that head**, and record the
  policy’s resolved authority.
- The headline metric is **`falseApproveRate`** — approving a change that should not merge (the dangerous
  error). Also watch false rejects.
- **Score only `authority = model` cases.** For human-gated changes the loop never consults the judge.
- Widen automation only when `falseApproveRate = 0` on that real corpus.

## Where to start

This topic is the **concept**; the **code** lives in the starter. It ships a small, dependency-free
reference implementation — the policy, the resolver, the fail-closed decision, the actuator, a forge port,
and a calibration scorer — plus the `pr-reviewer` and `judge` roles and the operational
[approval loop runbook](../app/docs/runbooks/approval-loop.md).
