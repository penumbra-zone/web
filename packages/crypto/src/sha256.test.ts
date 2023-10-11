import { describe, expect, test } from 'vitest';
import { sha256HashStr } from './sha256';

describe('sha256Hash', () => {
  test('returns correct hash for a given input', async () => {
    const input = new Uint8Array([65, 66, 67, 68]); // ASCII for 'ABCD'
    const expectedOutput = 'e12e115acf4552b2568b55e93cbd39394c4ef81c82447fafc997882a02d23677'; // SHA-256 of 'ABCD'
    const result = await sha256HashStr(input);
    expect(result).toBe(expectedOutput);
  });

  test('returns different hashes for different inputs', async () => {
    const input1 = new Uint8Array([1, 2, 3, 4]);
    const input2 = new Uint8Array([4, 3, 2, 1]);
    const result1 = await sha256HashStr(input1);
    const result2 = await sha256HashStr(input2);
    expect(result1).not.toBe(result2);
  });

  test('returns the same hash for the same input', async () => {
    const input = new Uint8Array([10, 20, 30, 40]);
    const result1 = await sha256HashStr(input);
    const result2 = await sha256HashStr(input);
    expect(result1).toBe(result2);
  });
});
