import { describe, expect, it } from 'vitest';
import { getProgress } from './get-progress';

describe('getProgress()', () => {
  const startHeight = 1_001n;
  const endHeight = 2_000n;

  it('returns 0 when `fullSyncHeight` is undefined and `seqNum` is undefined', () => {
    expect(getProgress(startHeight, endHeight, undefined, undefined)).toBe(0);
  });

  it('returns 0 when `fullSyncHeight` is undefined and `seqNum` is `0n`', () => {
    expect(getProgress(startHeight, endHeight, undefined, 0n)).toBe(0);
  });

  it('returns 1 when `fullSyncHeight` is undefined and `seqNum` is `1n`', () => {
    expect(getProgress(startHeight, endHeight, undefined, 1n)).toBe(1);
  });

  it('returns a decimal representing the progress between the start and end heights when `seqNum` is undefined', () => {
    const fullSyncHeight = 1_500n;

    expect(getProgress(startHeight, endHeight, fullSyncHeight)).toBe(0.5);
  });

  it('returns a decimal representing the progress between the start and end heights when `seqNum` is `0n`', () => {
    const fullSyncHeight = 1_500n;
    const seqNum = 0n;

    expect(getProgress(startHeight, endHeight, fullSyncHeight, seqNum)).toBe(0.5);
  });

  it('returns 1 if `seqNum` is greater than 0 which means the auction has ended)', () => {
    const fullSyncHeight = 1_500n;
    const seqNum = 1n;

    expect(getProgress(startHeight, endHeight, fullSyncHeight, seqNum)).toBe(1);
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
