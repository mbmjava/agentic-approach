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

// The approval toggle. Precedence: hold -> risk path -> explicit label (human wins ties) -> default.
// Returns { authority: 'model' | 'human', reason, file? }.
export function resolveAuthority({ config, labels = [], changedFiles = [] }) {
  const set = new Set(labels);
  if (set.has(config.labels.hold)) return { authority: 'human', reason: 'hold' };
  const risk = firstMatch(changedFiles, config.riskPaths);
  if (risk) return { authority: 'human', reason: `risk-path:${risk.pattern}`, file: risk.file };
  if (set.has(config.labels.human)) return { authority: 'human', reason: 'label:human' };
  if (set.has(config.labels.model)) return { authority: 'model', reason: 'label:model' };
  return { authority: config.approval.default, reason: 'default' };
}
