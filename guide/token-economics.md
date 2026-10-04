# Token economics and cost

This is the canonical place for token-share estimates and cost examples. Other topics link here instead of repeating the numbers, so the figures stay in sync.

## Plan for token allocation

For a large, well-scoped, cross-stack change—such as work spanning Java, React, a database, Kubernetes, tests, and documentation—a reasonable **initial planning estimate** is:

| Work pattern | Orchestrator tokens | All worker tokens combined |
| --- | ---: | ---: |
| Large, separable full-stack implementation | 20–35% | 65–80% |
| Highly ambiguous or product-heavy collaboration | 35–55% | 45–65% |
| Mostly mechanical work with stable specifications | 10–20% | 80–90% |

For the first case, **about 25% orchestrator / 75% workers** is a useful budgeting hypothesis—not a performance guarantee or a universal target. “Orchestrator tokens” include its user dialogue, framing, dispatch, synthesis, integration, and verification. “Worker tokens” include the combined context, analysis, implementation, and self-checks of all workers.

For a substantial, well-scoped Java/React/database/infrastructure feature, the same 25% orchestrator / 75% workers split is a reasonable initial assumption. It is not a measured benchmark and should not become a quota.

## Cost interpretation

The intent is to reserve expensive orchestrator capacity for user collaboration, judgment, cross-layer decisions, and acceptance, while using suitable lower-cost workers for bounded execution and evidence gathering. This can increase throughput and preserve quality, but only when coordination, review, and rework do not erase the savings.

**Token share is not cost share.** A premium orchestrator can consume a smaller fraction of tokens yet account for a larger fraction of spend. Calculate actual spend using each model's input/output rates and applicable cached-token pricing or plan limits. Also track elapsed time and human review effort; optimizing token percentage alone can make the overall workflow worse.

Treat these ranges as a starting assumption for planning. After several representative tasks, replace them with project data on tokens and cost by role, accepted outcomes, latency, review time, retries, rework, and escaped defects. A higher worker share is valuable only if the accepted result remains correct and the total effort or cost improves.

## Illustrative OpenRouter cost example

The following shows how the split could affect API cost for a large project. The prices below match OpenRouter's endpoint listings checked on **2026-10-01** for the specified routes; verify live rates before using the numbers for a budget. The token volumes are **illustrative envelopes**, not measured the source project telemetry.

| Model role | Model | Input / output price per 1M tokens |
| --- | --- | ---: |
| All-Sonnet comparison baseline | `anthropic/claude-sonnet-5` | $2.00 / $10.00 (input / output) |
| Orchestrator in the mixed setup | `openai/gpt-6-luna` | $0.10 / $0.50 (input / output) |
| Workers in the mixed setup | `poolside/laguna-s-2.1` | $0.09 / $0.18 (input / output) |

**Routing note:** GPT-6 Luna has multiple OpenRouter endpoints with different prices. This example uses the standard OpenAI route at $0.10/$0.50 per million. The endpoint listing also showed OpenAI Flex at $0.05/$0.25 and OpenAI Fast at $0.20/$1.00 per million. The standard route has a higher price tier for individual prompts above 272K tokens; Flex and other provider endpoints have their own rates and thresholds. Claude Sonnet 5's listed standard rate was $2/$10 per million; some alternate provider endpoints differ. The actual charge depends on the route selected for each request, so use the model's live endpoint listing or recorded OpenRouter usage—not just the model ID—to forecast spend.

Assume 25% of both input and output tokens go to the orchestrator and 75% to workers. For each scenario, compare the mixed setup with running the **same total token volume** entirely on Sonnet 5:

<table>
<tr><td>Scenario (total input / output)</td><td>All Sonnet 5</td><td>Mixed orchestrator</td><td>Mixed workers</td><td>Mixed total</td><td>Difference vs. baseline</td></tr>
<tr><td>Small (1M / 0.2M)</td><td>$4.00</td><td>$0.05</td><td>$0.0945</td><td>$0.1445</td><td>~96.4% lower</td></tr>
<tr><td>Medium (5M / 1M)</td><td>$20.00</td><td>$0.25</td><td>$0.4725</td><td>$0.7225</td><td>~96.4% lower</td></tr>
<tr><td>Large (20M / 4M)</td><td>$80.00</td><td>$1.00</td><td>$1.89</td><td>$2.89</td><td>~96.4% lower</td></tr>
</table>

The mixed totals break down as follows:

- **Small:** $0.05 orchestrator + $0.0945 workers = **$0.1445 total**, about **96.4% lower** than the $4.00 all-Sonnet baseline.
- **Medium:** $0.25 orchestrator + $0.4725 workers = **$0.7225 total**, about **96.4% lower** than the $20.00 all-Sonnet baseline.
- **Large:** $1.00 orchestrator + $1.89 workers = **$2.89 total**, about **96.4% lower** than the $80.00 all-Sonnet baseline.

**Calculation:** cost = (input tokens ÷ 1,000,000 × input rate) + (output tokens ÷ 1,000,000 × output rate). For example, the medium mixed orchestrator costs `(1.25 × $0.10) + (0.25 × $0.50) = $0.25`; the workers cost `(3.75 × $0.09) + (0.75 × $0.18) = $0.4725`.

**What the example shows:** under these assumptions, routing most tokens to the lower-priced worker model makes API generation cheaper than using Sonnet 5 for all tokens, while retaining the orchestrator for collaboration and judgment. This is a price comparison, **not proof of equal quality or a forecast of actual project savings**. More worker rounds, duplicated repository context, retries, or human review can change the result. It also assumes every worker token uses Laguna S 2.1; a separate mechanical-worker model would need its own rate in the calculation.

These amounts exclude any caching discounts or other pricing adjustments and assume the exact same input/output token volumes in both setups. Record actual role-level token usage and cost during a pilot, then compare quality, accepted-work rate, latency, review effort, and rework before making a budget claim. Current endpoint listings: [Claude Sonnet 5](https://openrouter.ai/api/v1/models/anthropic/claude-sonnet-5/endpoints), [GPT-6 Luna](https://openrouter.ai/api/v1/models/openai/gpt-6-luna/endpoints), and [Laguna S 2.1](https://openrouter.ai/api/v1/models/poolside/laguna-s-2.1/endpoints).
