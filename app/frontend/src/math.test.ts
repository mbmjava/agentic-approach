import { test, expect } from 'vitest';
import { add } from './math';

test('add sums two numbers', () => {
  expect(add(2, 3)).toBe(5);
});
