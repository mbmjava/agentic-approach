import { createGitHubForge } from './github.mjs';
import { createGitLabForge } from './gitlab.mjs';

// Forge port: every adapter implements the same interface so the loop stays forge-neutral.
//   getChange(id)          -> { id, forge, headSha, baseRef, author, draft, description, changedFiles[], labels[] }
//   getChecks(headSha)     -> { state: 'pass'|'fail'|'pending', runs[] }
//   postComment(id, body)
//   setLabel(id, name, on)
//   requestHumanReview(id, reviewers[])
//   merge(id, { method })
export function createForge({ config, token, allowMutations = false }) {
  const { provider, repo } = config.forge;
  if (provider === 'github') return createGitHubForge({ repo, token, allowMutations });
  if (provider === 'gitlab') return createGitLabForge({ repo, token, allowMutations });
  throw new Error(`Unsupported forge provider: ${provider}`);
}
