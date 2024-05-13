import { describe, expect, it } from 'vitest';
import { getProgress } from './get-progress';

describe('getProgress()', () => {
  const startHeight = 1_001n;
  const endHeight = 2_000n;

  it('returns 0 when `fullSyncHeight` is undefined', () => {
    expect(getProgress(startHeight, endHeight, undefined)).toBe(0);
  });

  it('returns a decimal representing the progress between the start and end heights', () => {
    const fullSyncHeight = 1_500n;

    expect(getProgress(startHeight, endHeight, fullSyncHeight)).toBe(0.5);
  });

  it('clamps to 0 if the start height has not yet been reached', () => {
    const fullSyncHeight = 500n;

    expect(getProgress(startHeight, endHeight, fullSyncHeight)).toBe(0);
  });

  it('clamps to 1 if the end height has been passed', () => {
    const fullSyncHeight = 10_000n;

    expect(getProgress(startHeight, endHeight, fullSyncHeight)).toBe(1);
  });
});
