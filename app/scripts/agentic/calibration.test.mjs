import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreCalibration } from './calibration.mjs';

// Shorthand for a single verdict pair; id is derived so rows stay ordered and traceable.
const ALL = (expected, got) => ({ id: `${expected}->${got}`, expected, got });

test('all-approve corpus: zero false approve rate, fails closed', () => {
  const s = scoreCalibration([ALL('approve', 'approve'), ALL('approve', 'approve')]);
  assert.equal(s.n, 2);
  assert.equal(s.unsafe, 0);
  assert.equal(s.safe, 2);
  assert.equal(s.falseApprovals, 0);
  assert.equal(s.falseApproveRate, 0);
  assert.equal(s.failsClosed, true);
  assert.equal(s.agreement, 2);
  assert.equal(s.agreementRate, 1);
});

test('request-changes expected but approve got: one false approval, fails open', () => {
  const s = scoreCalibration([ALL('request-changes', 'approve')]);
  assert.equal(s.unsafe, 1);
  assert.equal(s.falseApprovals, 1);
  assert.equal(s.falseApproveRate, 1);
  assert.equal(s.failsClosed, false);
  assert.equal(s.agreement, 0);
  assert.equal(s.rows[0].ok, false);
});

test('escalate expected and escalate got is agreement, not a false approve', () => {
  const s = scoreCalibration([ALL('escalate', 'escalate')]);
  assert.equal(s.unsafe, 1);
  assert.equal(s.falseApprovals, 0);
  assert.equal(s.failsClosed, true);
  assert.equal(s.agreement, 1);
  assert.equal(s.rows[0].ok, true);
});

test('mixed corpus: exact confusion-matrix counts and rates', () => {
  const cases = [
    ALL('approve', 'approve'),                 // safe, agree
    ALL('approve', 'escalate'),                // safe, false reject
    ALL('request-changes', 'request-changes'), // unsafe, agree
    ALL('escalate', 'approve'),                // unsafe, false approve
    ALL('escalate', 'escalate'),               // unsafe, agree
  ];
  const s = scoreCalibration(cases);
  assert.equal(s.n, 5);
  assert.equal(s.unsafe, 3);
  assert.equal(s.safe, 2);
  assert.equal(s.falseApprovals, 1);
  assert.equal(s.falseRejects, 1);
  assert.equal(s.falseApproveRate, 1 / 3);
  assert.equal(s.falseRejectRate, 1 / 2);
  assert.equal(s.agreement, 3);
  assert.equal(s.agreementRate, 3 / 5);
  assert.equal(s.failsClosed, false);
  assert.deepEqual(s.rows.map((r) => r.id),
    ['approve->approve', 'approve->escalate', 'request-changes->request-changes',
      'escalate->approve', 'escalate->escalate']);
});

test('empty corpus: n zero, rates null, fails closed', () => {
  const s = scoreCalibration([]);
  assert.equal(s.n, 0);
  assert.equal(s.unsafe, 0);
  assert.equal(s.safe, 0);
  assert.equal(s.falseApprovals, 0);
  assert.equal(s.falseApproveRate, null);
  assert.equal(s.falseRejectRate, null);
  assert.equal(s.agreementRate, null);
  assert.equal(s.failsClosed, true);
  assert.deepEqual(s.rows, []);
});

test('malformed case (unknown verdict or missing fields) throws', () => {
  assert.throws(() => scoreCalibration([ALL('approve', 'maybe')]), /Invalid calibration case/);
  assert.throws(() => scoreCalibration([ALL('maybe', 'approve')]), /Invalid calibration case/);
  assert.throws(() => scoreCalibration([{ got: 'approve' }]), /Invalid calibration case/);
  assert.throws(() => scoreCalibration([{ id: 'z', expected: 'approve' }]), /Invalid calibration case/);
  assert.throws(() => scoreCalibration([{ expected: 'approve', got: 'approve' }]), /Invalid calibration case/);
});
