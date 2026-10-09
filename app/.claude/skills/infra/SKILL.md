---
name: Infra spec
description: Formalize infrastructure, CI, deployment, migration, or operational work. Runs spec-base, including approval mode.
disable-model-invocation: true
---

# Infrastructure spec

1. Run the shared `spec-base` interview in order.
2. Ask which infrastructure/environment contracts change, rollout and rollback steps, blast radius, operator
   runbook needs, and the smallest safe increment.
3. Identify required secrets, provider permissions, data risks, and environment boundaries without putting
   secret values in the spec.
4. Write one draft requirement. High-risk implementation remains human-authorized by project policy even if
   the spec requests judge mode.
