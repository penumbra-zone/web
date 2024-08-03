import { describe, expect, it } from 'vitest';
import { getStepIndex } from './get-step-index';
import { DutchAuctionDescription } from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';

describe('getStepIndex()', () => {
  const dutchAuctionDescription = new DutchAuctionDescription({
    startHeight: 1_001n,
    endHeight: 2_000n,
    stepCount: 100n, // 1000 blocks / 100 steps = 10 blocks per step
  });

  it('returns undefined if `fullSyncHeight` is undefined', () => {
    expect(getStepIndex(new DutchAuctionDescription())).toBeUndefined();
  });

  it('returns the correct step index at various heights', () => {
    expect(getStepIndex(dutchAuctionDescription, 1_001n)).toBe(0n);
    expect(getStepIndex(dutchAuctionDescription, 1_501n)).toBe(50n);
    expect(getStepIndex(dutchAuctionDescription, 2_000n)).toBe(99n);
  });

  it('returns the correct step index when step sizes are small', () => {
    const smallStepSize = new DutchAuctionDescription({
      startHeight: 1n,
      endHeight: 5n,
      stepCount: 5n,
    });

    expect(getStepIndex(smallStepSize, 1n)).toBe(0n);
    expect(getStepIndex(smallStepSize, 2n)).toBe(1n);
    expect(getStepIndex(smallStepSize, 3n)).toBe(2n);
    expect(getStepIndex(smallStepSize, 4n)).toBe(3n);
    expect(getStepIndex(smallStepSize, 5n)).toBe(4n);
  });

  it('rounds down to the nearest step index', () => {
    expect(getStepIndex(dutchAuctionDescription, 1_009n)).toBe(0n);
    expect(getStepIndex(dutchAuctionDescription, 1_509n)).toBe(50n);
  });

  it("clamps the step index to 0 if the auction hasn't started yet", () => {
    const fullSyncHeight = 500n;

    expect(getStepIndex(dutchAuctionDescription, fullSyncHeight)).toBe(0n);
  });

  it('clamps the step index to `stepCount` if the auction period has passed', () => {
    const fullSyncHeight = 2_500n;

    expect(getStepIndex(dutchAuctionDescription, fullSyncHeight)).toBe(99n);
  });
});
