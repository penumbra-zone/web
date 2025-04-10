import { Decimal } from 'decimal.js';
import { removeTrailingZeros } from './shortify.js';

export type RoundingMode = 'half-up' | 'up' | 'down';

export interface RoundOptions {
  value: number | string;
  decimals: number;
  roundingMode?: RoundingMode;
  trailingZeros?: boolean;
  exponentialNotation?: boolean;
}

const EXPONENTIAL_NOTATION_THRESHOLD = new Decimal('1e21');

Decimal.set({ precision: 30 });

const getDecimalRoundingMode = (mode: RoundingMode): Decimal.Rounding => {
  switch (mode) {
    case 'up':
      return Decimal.ROUND_UP;
    case 'down':
      return Decimal.ROUND_DOWN;
    case 'half-up':
    default:
      return Decimal.ROUND_HALF_UP;
  }
};

/**
 * @param options - An object containing the properties:
 *   - value: The number to round.
 *   - decimals: The number of decimal places to round to.
 *   - roundingMode:
 *      - half-up: Default. Rounds towards nearest neighbour. If equidistant, rounds away from zero.
 *      - down: Rounds towards zero
 *      - up: Rounds way from zero
 */
export function round({
  value,
  decimals,
  roundingMode = 'half-up',
  trailingZeros = false,
  exponentialNotation = true,
}: RoundOptions): string {
  if (typeof value === 'string' && value.length === 0) {
    return '';
  }

  const decimalValue = new Decimal(value);

  // Determine if exponential notation is needed
  const isLargeNumber = decimalValue.abs().gte(EXPONENTIAL_NOTATION_THRESHOLD);
  const isSmallNumber = decimalValue.abs().lt(new Decimal('1e-4')) && !decimalValue.isZero();

  let result: string;

  if (exponentialNotation && (isLargeNumber || isSmallNumber)) {
    result = decimalValue.toExponential(decimals, getDecimalRoundingMode(roundingMode));
  } else {
    const roundedDecimal = decimalValue.toDecimalPlaces(
      decimals,
      getDecimalRoundingMode(roundingMode),
    );
    result = roundedDecimal.toFixed(decimals, getDecimalRoundingMode(roundingMode));
  }

  if (trailingZeros) {
    return result;
  }

  return removeTrailingZeros(result);
}
