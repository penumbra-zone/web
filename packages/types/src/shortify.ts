import { round } from './round.js';

/**
 * Removes all trailing zeros after the decimal point.
 * If the string ends with ".0", it removes the decimal point as well.
 *
 * Examples:
 * - "1.0000" becomes "1"
 * - "1.2000" becomes "1.2"
 * - "1.2300" becomes "1.23"
 * - "1.2340" becomes "1.234"
 * - "1.2345" remains "1.2345"
 */
export const removeTrailingZeros = (str: string): string => {
  return str.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
};

/**
 * Makes large numbers shorter. Examples:
 * - 999 -> 999
 * - 1_000 -> 1K
 * - 1_000_000 -> 1M
 * - 1_000_000_000 -> 1B
 * - 1_000_000_000_000 -> 1T
 */
export const shortify = (value: number): string => {
  let shortValue: number;
  let suffix = '';
  let decimals = 0;

  if (value < 1_000 && value > -1_000) {
    shortValue = value;
    suffix = '';
  } else if (value < 1_000_000 && value > -1_000_000) {
    shortValue = value / 1_000;
    suffix = 'K';
  } else if (value < 1_000_000_000 && value > -1_000_000_000) {
    shortValue = value / 1_000_000;
    suffix = 'M';
  } else if (value < 1_000_000_000_000 && value > -1_000_000_000_000) {
    shortValue = value / 1_000_000_000;
    suffix = 'B';
  } else {
    shortValue = value / 1_000_000_000_000;
    suffix = 'T';
  }

  // Determine the number of integer digits in the shortValue
  const absShortValue = Math.abs(shortValue);
  const integerDigits = Math.floor(absShortValue).toString().length;

  // Set decimals to set significant digits
  if (integerDigits >= 3) {
    decimals = 0;
  } else {
    decimals = 3 - integerDigits;
  }

  // Round the shortValue based on the decimals
  const roundedShortValueStr = round({
    value: shortValue,
    decimals: decimals,
    roundingMode: 'down', // Rounding toward zero
  });

  // Remove trailing zeros and append the suffix
  return `${removeTrailingZeros(roundedShortValueStr)}${suffix}`;
};
