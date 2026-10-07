// GitLab forge adapter — placeholder behind the same interface so the policy and loop stay
// forge-neutral. Implement over GitLab REST (merge requests, pipelines, labels) when needed.
function notImplemented() {
  throw new Error('GitLab forge adapter is not implemented yet');
}

export function createGitLabForge() {
  return {
    provider: 'gitlab',
    getChange: notImplemented,
    getChecks: notImplemented,
    postComment: notImplemented,
    setLabel: notImplemented,
    requestHumanReview: notImplemented,
    merge: notImplemented,
  };
}
