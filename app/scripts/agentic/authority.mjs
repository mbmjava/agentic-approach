const SPECIAL = '\\^$.|?+()[]{}';

// Minimal path glob: `**` spans separators, `*` and `?` do not. Not bash-complete, but enough
// for risk-path matching and identical across forges.
export function globToRegExp(glob) {
  let out = '';
  for (let i = 0; i < glob.length; i += 1) {
    const c = glob[i];
    if (c === '*') {
      if (glob[i + 1] === '*') {
        i += 1;
        if (glob[i + 1] === '/') {
          i += 1;
          out += '(?:.*/)?';
        } else {
          out += '.*';
        }
      } else {
        out += '[^/]*';
      }
    } else if (c === '?') {
      out += '[^/]';
    } else if (SPECIAL.includes(c)) {
      out += `\\${c}`;
    } else {
      out += c;
    }
  }
  return new RegExp(`^${out}$`);
}

function firstMatch(files, patterns) {
  for (const file of files) {
    const normalized = file.split('\\').join('/');
    for (const pattern of patterns) {
      if (globToRegExp(pattern).test(normalized)) return { file, pattern };
    }
  }
  return null;
}

// The approved spec is the approval source. Overrides can only reduce authority to human.
// Precedence: hold -> risk path -> unverified/missing mode -> human target/ineligible target -> spec mode.
// Returns { authority: 'model' | 'human', reason, file? }.
export function resolveAuthority({ config, labels = [], changedFiles = [], approvalMode, specError = null, baseRef }) {
  const set = new Set(labels);
  if (set.has(config.labels.hold)) return { authority: 'human', reason: 'hold' };
  const risk = firstMatch(changedFiles, config.riskPaths);
  if (risk) return { authority: 'human', reason: `risk-path:${risk.pattern}`, file: risk.file };
  if (specError) return { authority: 'human', reason: 'spec-mode:unverified' };
  if (baseRef === config.rollupBranch) return { authority: 'human', reason: 'target:human-only' };
  if (!baseRef) return { authority: 'human', reason: 'target:missing' };
  if (!firstMatch([baseRef], config.judgeMergeTargets)) {
    return { authority: 'human', reason: 'target:not-judge-eligible' };
  }
  if (approvalMode === 'human') return { authority: 'human', reason: 'spec-mode:human' };
  if (approvalMode === 'judge') return { authority: 'model', reason: 'spec-mode:judge' };
  return { authority: 'human', reason: approvalMode == null ? 'spec-mode:missing' : 'spec-mode:invalid' };
}
