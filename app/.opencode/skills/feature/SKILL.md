---
name: Feature spec
description: Formalize a new user-facing capability. Runs spec-base, including the required approval-mode choice.
metadata:
  opencode/autoinvoke: false
---

# Feature spec

1. Run the shared `spec-base` interview in order.
2. Ask feature-specific questions: who is the user, what job do they need done, what observable behavior
   changes, and how will success be measured?
3. Clarify API, data, UI, authorization, and migration surfaces where relevant.
4. Write one draft requirement using the approved answers. Do not implement it or dispatch workers in this
   skill; wave-start preflight is a separate gate after the spec is approved.
