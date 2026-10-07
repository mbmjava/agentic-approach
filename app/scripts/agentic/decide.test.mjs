import test from 'node:test';
import assert from 'node:assert/strict';
import { decide } from './decide.mjs';

test('human authority never merges', () => {
  assert.equal(decide({ authority: 'human', ciState: 'pass', judgeVerdict: 'approve' }).action, 'human');
});

test('model merges only when CI passes and the judge approves', () => {
  assert.deepEqual(decide({ authority: 'model', ciState: 'pass', judgeVerdict: 'approve' }),
    { action: 'merge', reason: 'model+ci-pass+judge-approve' });
});

test('fails closed on a non-approve judge verdict', () => {
  assert.equal(decide({ authority: 'model', ciState: 'pass', judgeVerdict: 'request-changes' }).action, 'escalate');
  assert.equal(decide({ authority: 'model', ciState: 'pass', judgeVerdict: 'escalate' }).action, 'escalate');
});

test('fails closed on missing judge verdict or non-green CI', () => {
  assert.equal(decide({ authority: 'model', ciState: 'pass', judgeVerdict: null }).action, 'escalate');
  assert.equal(decide({ authority: 'model', ciState: 'pending', judgeVerdict: 'approve' }).action, 'escalate');
  assert.equal(decide({ authority: 'model', ciState: 'fail', judgeVerdict: 'approve' }).action, 'escalate');
});

test('fails closed on an invalid authority', () => {
  assert.equal(decide({ authority: undefined, ciState: 'pass', judgeVerdict: 'approve' }).action, 'escalate');
});
