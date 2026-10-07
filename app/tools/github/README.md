# GitHub setup for the PR review flow

Layering: the **merge gate** is GitHub-native (branch protection / required checks); the **review and
approval loop** runs in the **orchestrator** — the agent session — using the forge-neutral spine in
`scripts/agentic/`. The forge port keeps the same loop provider-neutral, so it also serves GitLab
(`scripts/agentic/forge/gitlab.mjs`).

Two files (already in the repo) plus one repo setting:

- `.github/pull_request_template.md` — the checklist every PR carries.
- `.github/CODEOWNERS` — the **human** review channel for harness/infra paths.
- **Branch protection** — make CI a required gate (below).

> The reviewer/loop is **not** a GitHub Action and needs no separate service. The orchestrator runs
> `pr-reviewer` then `judge` on the PR head and decides with `scripts/agentic/apply.mjs`; the provider owns
> what is *required* to merge. See the [approval-loop runbook](../../docs/runbooks/approval-loop.md).

## 1. CODEOWNERS handle

`CODEOWNERS` uses `@mbmjava` as the owner. Replace it with the GitHub handle that should review
harness/infra changes. When a second developer joins, move a path to their handle — the flow is
unchanged.

## 2. Make CI a required gate (branch protection)

Until these checks are **required**, CI runs but nothing blocks a merge. Require `backend-test`,
`frontend-test`, `docs-check`, and `agentic-loop` on `main`.

Using the GitHub CLI (replace `OWNER/REPO`):

```bash
cat > /tmp/protection.json <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Backend Test (Java 21)", "Frontend Test (Node 20)", "Docs Check (links + frontmatter)", "Agentic Loop (policy + calibration)"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": { "required_approving_review_count": 0 },
  "restrictions": null
}
JSON

gh api -X PUT repos/OWNER/REPO/branches/main/protection --input /tmp/protection.json
```

Notes:
- The check **contexts** must match the CI job `name:` values in `.github/workflows/ci.yml` exactly.
  Confirm them from a recent PR's checks if they differ.
- `enforce_admins: false` lets the owner override while solo; set `true` once a team is in place.
- `required_approving_review_count: 0` is correct for solo; CODEOWNERS still routes review for harness
  paths, and the orchestrator's review still comments. Raise it when a second developer joins.
- Prefer **rulesets** (Settings → Rules) over classic protection if you want the newer UI; same effect.

## 3. Point the loop at the repo

Set `forge.provider: "github"` and `forge.repo: "OWNER/REPO"` in `.agentic/config.json`, and provide
`AGENTIC_FORGE_TOKEN` in the environment. The orchestrator then runs the loop from
[the runbook](../../docs/runbooks/approval-loop.md).
