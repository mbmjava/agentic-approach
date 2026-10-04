# Worker assignment template

Copy this into the dispatch prompt. Keep it tight — the model only knows what you paste.

```
AGENT: worker            # reasoned implementation / critique / diagnosis
# or: worker-xs          # mechanical, unambiguous edits
ROLE: You are a subagent. Work from this brief alone and return findings/results to the orchestrator only.
Do not message the user directly.

GOAL: <one sentence — what to produce>

ACCEPTANCE ("done" looks like):
- <concrete, checkable criterion>
- <…>

EXACT FILES YOU MAY WRITE (nothing else):
- <path>
- <path>

READ FIRST (for context / style):
- <path>  <!-- interfaces, records, an existing sibling to match -->

CONVENTIONS:
- hexagonal layout (domain/ports/adapters); constructor injection (`private final`); no new deps;
  hermetic unit tests (no live infra).
- comments explain WHY, not what.

OUT OF SCOPE:
- <what not to touch / not to decide>

REPORT BACK:
- the unified diff (or exact old/new snippets) of each change — not whole files;
- any uncertainty or ambiguity (stop and ask rather than guess);
- the exact signatures/values you produced.
```

## Notes

- **Background it.** Dispatch in the background; you are notified on completion.
- **One file-set per worker.** Never give two workers the same file. Fan out only over disjoint
  files.
- **Verify after.** `git status --short`; reject anything outside the named scope before staging.
  Rework via a fresh dispatch with the critique.
- **Bounded commands only.** The worker may run only the approved wrappers (see the worker skill);
  never assign a task whose acceptance needs the live stack.
