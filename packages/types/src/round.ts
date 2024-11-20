import { ceil as lodashCeil, floor as lodashFloor, round as lodashRound } from 'lodash';
import { removeTrailingZeros } from './shortify.js';

export type RoundingMode = 'round' | 'ceil' | 'floor';

export interface RoundOptions {
  value: number;
  decimals: number;
  roundingMode?: RoundingMode;
}

const roundingStrategies = {
  ceil: lodashCeil,
  floor: lodashFloor,
  round: lodashRound,
} as const;

const EXPONENTIAL_NOTATION_THRESHOLD = 1e21;

/**
 * Rounds a number based on the specified options.
 *
 * @param options - An object containing the properties:
 *   - value: The number to round.
 *   - decimals: The number of decimal places to round to.
 *   - roundingMode: The mode of rounding ('round', 'ceil', 'floor'). Defaults to 'round'.
 *
 * @returns A string representation of the rounded number.
 *
 * @example
 *
 * ```typescript
 * round({ value: 1.2345, decimals: 2, roundingMode: 'ceil' }); // "1.24"
 * round({ value: 1.2345, decimals: 2, roundingMode: 'floor' }); // "1.23"
 * round({ value: 1.2345, decimals: 2 }); // "1.23" (default rounding)
 * ```
 */
export function round({ value, decimals, roundingMode = 'round' }: RoundOptions): string {
  const roundingFn = roundingStrategies[roundingMode];
  const roundedNumber = roundingFn(value, decimals);

  let result: string;

  const isLargeNumber = Math.abs(roundedNumber) >= EXPONENTIAL_NOTATION_THRESHOLD;
  const isSmallNumber = Math.abs(roundedNumber) < 1e-4 && roundedNumber !== 0;

  if (isLargeNumber || isSmallNumber) {
    result = roundedNumber.toExponential(decimals);
  } else {
    result = roundedNumber.toFixed(decimals);
  }

  return removeTrailingZeros(result);
}
