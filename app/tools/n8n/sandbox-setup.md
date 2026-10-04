# n8n code sandbox (n8n Assistant / Agents)

n8n Assistant and Agents run code and work with files **in a sandbox**, not on the n8n host. That sandbox
is a separate service (`n8n-sandbox-service`) that n8n calls over an API. This documents how to stand it
up on a Docker host the n8n instance can reach, and how to point n8n at it.

Sources: [Set up n8n Assistant](https://docs.n8n.io/deploy/host-n8n/configure-n8n/set-up-n8n-assistant) ·
[n8n-sandbox-service](https://github.com/n8n-io/n8n-sandbox-service). Requires n8n **2.35+** (we run 2.41.6).

## What you need

- n8n 2.35+ with the `instance-ai` (and optionally `agents`) module.
- A model provider key (Anthropic / OpenAI / OpenRouter).
- **A sandbox host n8n can reach** — either self-hosted `n8n-sandbox-service`, or a Daytona account.

> The sandbox runner uses **Sysbox** for unprivileged Docker-in-Docker, which is **Linux-only**. Docker
> Desktop on Windows can't run it — use a separate Linux Docker host, or Daytona.

## Option A — self-host the sandbox service (dev / local)

On a **Linux** Docker host reachable from n8n:

```bash
# 1. Sysbox (one-time; Ubuntu/Debian, kernel > 5.19)
curl -fsSL -o setup-sysbox.sh https://raw.githubusercontent.com/n8n-io/n8n-sandbox-service/refs/heads/main/scripts/setup-sysbox.sh
chmod +x setup-sysbox.sh && ./setup-sysbox.sh --dry-run && ./setup-sysbox.sh

# 2. Sandbox stack (api + runner + tls-init)
curl -fsSL -o compose.yaml https://raw.githubusercontent.com/n8n-io/n8n-sandbox-service/refs/heads/main/docs/examples/compose.linux.yaml
curl -fsSL -o .env.example https://raw.githubusercontent.com/n8n-io/n8n-sandbox-service/refs/heads/main/docs/examples/.env.example
cp .env.example .env    # set strong values (see below)
docker compose up -d

# 3. Health check — expect {"status":"ok"}
curl http://<sandbox-host>:8080/healthz
```

Secrets in `.env` (replace `changeme`; the API and runner values must match where noted):

```
SANDBOX_API_KEYS=<a strong api key>            # n8n's N8N_SANDBOX_SERVICE_API_KEY must match this
SANDBOX_API_RUNNER_REGISTRATION_TOKEN=<secret>
SANDBOX_API_RUNNER_API_KEY=<secret>            # must match SANDBOX_RUNNER_API_KEYS
SANDBOX_RUNNER_API_KEYS=<same as SANDBOX_API_RUNNER_API_KEY>
SANDBOX_RUNNER_REGISTRATION_TOKEN=<same as registration token>
```

Notes:
- The API publishes **:8080**; the runner uses `sysbox-runc`. Certificates are issued for the service
  names `n8n-sandbox-api` / `n8n-sandbox-runner-<n>` — keep them (or regenerate certs with matching SANs).
- On macOS, use the repo's `quickstart-macos.md` instead. On Kubernetes, use the chart
  (`quickstart-k8s.md`).

## Option B — Daytona (managed sandbox, recommended for production)

No containers to host. Point n8n at Daytona (see below) with `N8N_INSTANCE_AI_SANDBOX_PROVIDER=daytona`,
`DAYTONA_API_URL`, `DAYTONA_API_KEY`, and `N8N_INSTANCE_AI_SANDBOX_IMAGE=daytonaio/sandbox:0.5.3-slim`.

## Point n8n at the sandbox

Set these on the n8n instance (for example in `.env.local`, then recreate `tw-n8n`). The compose file already
passes them through with safe defaults.

```bash
N8N_ENABLED_MODULES=instance-ai,agents
N8N_INSTANCE_AI_MODEL=openrouter/openai/gpt-6-luna
N8N_INSTANCE_AI_MODEL_API_KEY=<your provider key>

# Sandbox (required)
N8N_INSTANCE_AI_SANDBOX_ENABLED=true
N8N_INSTANCE_AI_SANDBOX_PROVIDER=n8n-sandbox            # or: daytona
N8N_SANDBOX_SERVICE_URL=http://<sandbox-host>:8080      # API url reachable from tw-n8n
N8N_SANDBOX_SERVICE_API_KEY=<must match SANDBOX_API_KEYS>
```

- If the sandbox runs on the **same host** as n8n, use `http://host.docker.internal:8080`.
- `N8N_SANDBOX_SERVICE_API_KEY` must match a value in `SANDBOX_API_KEYS` on the API container.

Restart n8n after changing env:

```bash
docker compose --env-file .env.local up -d n8n
```

## Verify

- Sandbox: `curl http://<sandbox-host>:8080/healthz` → `{"status":"ok"}`.
- n8n: open the editor; n8n Assistant appears and can run code. Confirm in n8n's logs that the
  `instance-ai` module loaded.

## Troubleshooting

- `N8N_SANDBOX_SERVICE_URL` must be **reachable from the n8n container** (not just your browser).
- The API key must match `SANDBOX_API_KEYS` exactly.
- Hostnames/SANs must match the issued certificates (`sandbox-api`, `sandbox-runner-<n>`).
- The runner pulls its sandbox image on first use; air-gapped hosts must preload it.

## Security

The runner is a **privileged Docker-in-Docker** container — the reason to run the sandbox on its own host
rather than next to n8n. Keep it off the public internet; expose only the API to the n8n host.
