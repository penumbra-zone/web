import { describe, expect, test } from 'vitest';
import { DURATION_IN_BLOCKS, STEP_COUNT } from './constants';

const isCleanlyDivisible = (numerator: bigint, denominator: bigint): boolean =>
  Number(numerator) % Number(denominator) === 0;

/**
 * "Why are we testing a constants file?!" Good question!
 *
 * Each duration for an auction needs to be cleanly divisible by the step count
 * so that sub-auctions can be evenly distributed. If an unsuspecting developer
 * changes some of the constants in `./constants.ts` in the future, there could
 * be durations that aren't cleanly divisible by the step count. So this test
 * suite ensures that that case never happens.
 */
describe('DURATION_IN_BLOCKS and STEP_COUNT', () => {
  test('every duration option is cleanly divisible by `STEP_COUNT`', () => {
    Object.values(DURATION_IN_BLOCKS).forEach(duration => {
      expect(isCleanlyDivisible(duration, STEP_COUNT)).toBe(true);
    });
  });
});
