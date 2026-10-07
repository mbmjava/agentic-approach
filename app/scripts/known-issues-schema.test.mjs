import assert from 'node:assert/strict';
import test from 'node:test';
import { checkKnownIssues } from './lib/known-issues-schema.mjs';

const validRegister = `# Known issues

## Summary
| ID | Title | Status | Severity | Owner | Target |
| --- | --- | --- | --- | --- | --- |
| K1 | First issue | open | low | Maintainer | none |
| K3 | Third issue | accepted | medium | Maintainer | next review |

## Details
### K1 — First issue
- **Status:** open · **Severity:** low · **Owner:** Maintainer · **Opened:** 2026-10-05 · **Target:** none
- **Impact:** A failure can go unnoticed.
- **Where:** ` + '`frontend`' + `
- **Trigger:** The browser path changes.
- **Next:** Add a browser test.

### K3 — Third issue
- **Status:** accepted · **Severity:** medium · **Owner:** Maintainer · **Opened:** 2026-10-05 · **Target:** next review
- **Impact:** A slow command may be stopped.
- **Where:** ` + '`scripts/worker-verify.mjs`' + `
- **Trigger:** A healthy build exceeds the timeout.
- **Next:** Revisit if it recurs.
`;

test('accepts complete summary/detail records and gaps from deleted IDs', () => {
  assert.deepEqual(checkKnownIssues(validRegister), []);
});

test('rejects missing required fields', () => {
  const incomplete = validRegister.replace('- **Next:** Add a browser test.\n', '');
  assert.ok(checkKnownIssues(incomplete).some((error) => error.includes("K1 must have exactly one non-empty 'Next' field")));
});

test('rejects summary/detail mismatches', () => {
  const mismatch = validRegister.replace('| K1 | First issue | open | low |', '| K1 | First issue | open | high |');
  assert.ok(checkKnownIssues(mismatch).some((error) => error.includes('summary row K1 Severity')));
});

test('rejects invalid severity and opened-date formats', () => {
  const invalid = validRegister
    .replace('**Severity:** low', '**Severity:** urgent')
    .replace('Opened:** 2026-10-05', 'Opened:** 2026-10-5');
  const errors = checkKnownIssues(invalid);
  assert.ok(errors.some((error) => error.includes("invalid Severity 'urgent'")));
  assert.ok(errors.some((error) => error.includes('Opened must use YYYY-MM-DD')));
});

test('rejects duplicate IDs and unpaired detail blocks', () => {
  const duplicate = validRegister.replace('| K3 | Third issue', '| K1 | Third issue');
  const errors = checkKnownIssues(duplicate);
  assert.ok(errors.some((error) => error.includes('duplicate summary id K1')));
  assert.ok(errors.some((error) => error.includes('detail block K3 has no summary row')));
});

test('rejects summary rows without a K-number ID', () => {
  const malformed = validRegister.replace('| K1 | First issue', '| first | First issue');
  assert.ok(checkKnownIssues(malformed).some((error) => error.includes("summary row has invalid ID 'first'")));
});
