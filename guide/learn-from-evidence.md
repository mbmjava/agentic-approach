# Improve the workflow with evidence

Agentic workflows should improve through observable outcomes, not by adding roles, rules, and tools whenever one task goes badly.

## Measure the work that matters

For tasks with repeated or non-deterministic outcomes, define a small benchmark before tuning:

1. Keep a stable set of representative tasks or questions.
2. Define independently checked expected outcomes.
3. Repeat runs when randomness can change results.
4. Record the selected model, configuration, inputs, and measured outcome.
5. Classify failures before changing prompts, routing, or tools.
6. Change one important variable at a time and compare with the baseline.

Separate retrieval or routing failures from reasoning, tool, integration, and scoring failures. A single overall score can hide where the system broke.

## Preserve evidence, not noise

Keep the summary needed to make the next decision in the living plan. Put detailed iteration history, raw reports, and logs in a clearly identified working or generated location. Do not let generated output or an old experiment become the authoritative statement of current behavior.

For every conclusion, state the evidence and its limits. “Unit tests passed” does not mean the live service was tested; a successful process exit does not prove an untested behavior; one good model run is not a stable quality result.

Not every quality goal is captured by a test or score. Ask the user whether the result feels right, whether the collaboration was useful, and where the model added or created friction. Use that feedback to adjust the interaction pattern, not only the implementation.

Track the economics of accepted work, not just raw token totals or worker count: orchestrator effort saved, worker cost, latency, review time, rework, and defects caught or missed. Cheap output that creates expensive rework is not an efficiency gain. Use the results to decide which task classes should default to workers and which should remain with the orchestrator.

### Starting estimates for planning

Until you have your own data, use broad token-share estimates rather than point forecasts. The estimates and a worked OpenRouter cost comparison live in one canonical topic so they do not drift: see [Token economics and cost](token-economics.md). Replace the estimates with measurements from several representative tasks—spend, time to an accepted result, review effort, and rework—before relying on them.

## Promote discoveries carefully

- A recurring, stable convention belongs in repository instructions or a standard.
- A hard-to-reverse choice belongs in a decision record.
- A current workstream's next steps belong in its plan.
- Temporary observations stay in scratch notes or experiment logs until verified.
- Remove or supersede stale guidance instead of maintaining competing versions; see [Prevent documentation bloat](documentation-bloat.md).

The source project's in-well search evaluation is a useful example: a fixed corpus and repeated runs exposed model variance and distinguished missed file-search routes from vector-retrieval misses. Its scores and model names are dated observations, not promises about other codebases or future versions.

## Review the process itself

When a task goes badly, the fix is usually a change to the harness—an instruction, a skill, a wrapper, or a permission—not only a code fix. Close that loop: capture the failure mode, change the smallest thing that prevents it, and note the change. This is the same discipline as [anti-pattern](anti-patterns.md) avoidance, applied to your own setup.

Periodically ask:

- Are workers reducing cycle time or merely adding coordination?
- Do assignment boundaries prevent overlap without making simple tasks cumbersome?
- Are timeouts and wrappers reporting trustworthy completion?
- Can a new session resume from the plan and handoff without relying on private chat history?
- Which policy exists because of measured evidence, and which one has become ceremony?

Keep rules that prevent recurring errors. Simplify rules whose cost exceeds the problem they solve.
