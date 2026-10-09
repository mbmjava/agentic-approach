const DEFAULT_API = 'https://api.github.com';

// GitHub forge adapter over REST (never the `gh` CLI, so the loop stays forge-neutral).
// Read-only unless `allowMutations` is set (enabled at the stage that is authorized to write).
export function createGitHubForge({ repo, token, allowMutations = false, apiBase = DEFAULT_API, fetchImpl = fetch, maxPages = 100 }) {
  if (!repo || !repo.includes('/')) throw new Error(`GitHub forge requires 'owner/name' repo, got '${repo}'`);
  const [owner, name] = repo.split('/');
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'agentic-approval-loop' };
  if (token) headers.Authorization = `Bearer ${token}`;

  async function call(method, path, body) {
    const res = await fetchImpl(`${apiBase}${path}`, {
      method, headers, body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`GitHub ${method} ${path} -> ${res.status}`);
    return res.status === 204 ? null : res.json();
  }

  // Follow pagination so a later page is never silently dropped (a risk file or failing
  // check on page 2 must still be seen). Fail closed if the cap is hit with a full page.
  async function getAllPages(path, pick) {
    const items = [];
    for (let page = 1; page <= maxPages; page += 1) {
      const data = await call('GET', `${path}?per_page=100&page=${page}`);
      const batch = pick(data);
      items.push(...batch);
      if (batch.length < 100) return items;
    }
    throw new Error(`Pagination cap (${maxPages * 100} items) reached for ${path}; refusing partial results`);
  }

  function requireMutations() {
    if (!allowMutations) {
      throw new Error('GitHub forge is read-only in this stage; mutations are disabled');
    }
  }

  return {
    provider: 'github',
    async getChange(id) {
      const pull = await call('GET', `/repos/${owner}/${name}/pulls/${id}`);
      const files = await getAllPages(`/repos/${owner}/${name}/pulls/${id}/files`, (d) => d);
      return {
        id: Number(id),
        forge: 'github',
        headSha: pull.head.sha,
        baseRef: pull.base.ref,
        author: pull.user?.login ?? null,
        draft: pull.draft === true,
        description: pull.body ?? '',
        changedFiles: files.map((f) => f.filename),
        labels: (pull.labels ?? []).map((l) => l.name),
      };
    },
    async getChecks(headSha) {
      const runs = await getAllPages(
        `/repos/${owner}/${name}/commits/${headSha}/check-runs`, (d) => d.check_runs ?? []);
      // A skipped required check is not evidence that the required work ran; fail closed.
      const passing = ['success', 'neutral'];
      let state = 'pending';
      if (runs.length > 0 && runs.every((r) => r.status === 'completed')) {
        state = runs.every((r) => passing.includes(r.conclusion)) ? 'pass' : 'fail';
      }
      return { state, runs: runs.map((r) => ({ name: r.name, status: r.status, conclusion: r.conclusion })) };
    },
    async postComment(id, body) {
      requireMutations();
      return call('POST', `/repos/${owner}/${name}/issues/${id}/comments`, { body });
    },
    async setLabel(id, label, on) {
      requireMutations();
      if (on) return call('POST', `/repos/${owner}/${name}/issues/${id}/labels`, { labels: [label] });
      try {
        return await call('DELETE', `/repos/${owner}/${name}/issues/${id}/labels/${encodeURIComponent(label)}`);
      } catch {
        return null;
      }
    },
    async requestHumanReview(id, reviewers = []) {
      requireMutations();
      return call('POST', `/repos/${owner}/${name}/pulls/${id}/requested_reviewers`, { reviewers });
    },
    async merge(id, { method = 'squash', sha } = {}) {
      requireMutations();
      const body = { merge_method: method };
      if (sha) body.sha = sha;
      return call('PUT', `/repos/${owner}/${name}/pulls/${id}/merge`, body);
    },
  };
}
