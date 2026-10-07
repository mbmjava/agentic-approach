// Fail-closed decision for the approval loop. Given the resolved authority, the CI state, and the
// judge verdict, decide the action. Anything short of "model + CI pass + judge approve" does not merge.
//
//   authority: 'model' | 'human'
//   ciState:   'pass' | 'fail' | 'pending'
//   judgeVerdict: 'approve' | 'request-changes' | 'escalate' | null
export function decide({ authority, ciState, judgeVerdict }) {
  if (authority !== 'model' && authority !== 'human') {
    return { action: 'escalate', reason: 'invalid-authority' };
  }
  if (authority === 'human') {
    return { action: 'human', reason: 'authority:human' };
  }
  if (judgeVerdict !== 'approve') {
    return { action: 'escalate', reason: `judge:${judgeVerdict ?? 'missing'}` };
  }
  if (ciState !== 'pass') {
    return { action: 'escalate', reason: `ci:${ciState ?? 'unknown'}` };
  }
  return { action: 'merge', reason: 'model+ci-pass+judge-approve' };
}
