# GitHub setup for the PR review flow

Layering: the **merge gate** is GitHub-native; the **advisor** (the reviewer) is n8n — provider-neutral,
so the same advisor serves GitLab projects too (`tools/n8n/`).

Two files (already in the repo) plus one repo setting:

- `.github/pull_request_template.md` — the checklist every PR carries.
- `.github/CODEOWNERS` — the **human** review channel for harness/infra paths.
- **Branch protection** — make CI a required gate (below).

> The advisory reviewer is **not** a GitHub Action. It runs in n8n
> (`tools/n8n/pr-review.workflow.json`, GitHub variant) so one advisor spans GitHub and GitLab.

## 1. CODEOWNERS handle

`CODEOWNERS` uses `@mbmjava` as the owner. Replace it with the GitHub handle that should review
harness/infra changes. When a second developer joins, move a path to their handle — the flow is
unchanged.

## 2. Make CI a required gate (branch protection)

Until these checks are **required**, CI runs but nothing blocks a merge. Require `backend-test`,
`frontend-test`, and `docs-check` on `main`.

Using the GitHub CLI (replace `OWNER/REPO`):

```bash
cat > /tmp/protection.json <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Backend Test (Java 21)", "Frontend Test (Node 20)", "Docs Check (links + frontmatter)"]
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
  paths, and the n8n advisor still comments. Raise it when a second developer joins.
- Prefer **rulesets** (Settings → Rules) over classic protection if you want the newer UI; same effect.

## 3. Point the advisor at the repo

The n8n advisor polls open PRs; set `OWNER/REPO` in `tools/n8n/pr-review.workflow.json` and attach the
GitHub header-auth credential. See `tools/n8n/README.md`.
