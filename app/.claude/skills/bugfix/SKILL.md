---
name: Bugfix spec
description: Formalize a reproducible defect. Runs spec-base, including approval mode and regression acceptance.
disable-model-invocation: true
---

# Bugfix spec

1. Run the shared `spec-base` interview in order.
2. Ask for reproduction steps, expected versus actual behavior, evidence, suspected scope, and the regression
   test that must prevent recurrence.
3. Define the smallest correction and explicit non-goals.
4. Write one draft requirement. Do not implement or dispatch workers before the approved-spec preflight.
