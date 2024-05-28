import { describe, expect, test } from 'vitest';
import { GDA_RECIPES, STEP_COUNT } from './constants';

const isCleanlyDivisible = (numerator: bigint, denominator: bigint): boolean =>
  Number(numerator) % Number(denominator) === 0;

/**
 * "Why are we testing a constants file?!" Good question!
 *
 * Each duration for a sub-auction needs to be cleanly divisible by the step
 * count so that sub-auctions can be evenly distributed. If an unsuspecting
 * developer changes some of the constants in `./constants.ts` in the future,
 * there could be durations that aren't cleanly divisible by the step count. So
 * this test suite ensures that that case never happens.
 */
describe('`GDA_RECIPES` and `STEP_COUNT`', () => {
  test('every sub-auction option is cleanly divisible by `STEP_COUNT`', () => {
    Object.values(GDA_RECIPES).forEach(recipe => {
      expect(isCleanlyDivisible(recipe.subAuctionDurationInBlocks, STEP_COUNT)).toBe(true);
    });
  });
});
