import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { fromBaseUnit, joinLoHi, splitLoHi } from './lo-hi';
import { BigNumber } from 'bignumber.js';
import { ValueView_KnownAssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/src/metadata';

export const joinLoHiAmount = (amount: Amount): bigint => {
  return joinLoHi(amount.lo, amount.hi);
};

export const fromBaseUnitAmount = (amount: Amount, exponent = 0): BigNumber => {
  return fromBaseUnit(amount.lo, amount.hi, exponent);
};

export const isZero = (amount: Amount): boolean => {
  return joinLoHi(amount.lo, amount.hi) === 0n;
};

export const fromValueView = ({ amount, metadata }: ValueView_KnownAssetId): BigNumber => {
  if (!amount) throw new Error('No amount in value view');
  if (!metadata) throw new Error('No denom in value view');

  return fromBaseUnitAmount(amount, getDisplayDenomExponent(metadata));
};

export const addAmounts = (a: Amount, b: Amount): Amount => {
  const joined = joinLoHiAmount(a) + joinLoHiAmount(b);
  const { lo, hi } = splitLoHi(joined);
  return new Amount({ lo, hi });
};

export const subtractAmounts = (minuend: Amount, subtrahend: Amount): Amount => {
  const joinedMinuend = joinLoHiAmount(minuend);
  const joinedSubtrahend = joinLoHiAmount(subtrahend);

  if (joinedSubtrahend > joinedMinuend) throw new Error('Amount cannot be negative');

  const joined = joinedMinuend - joinedSubtrahend;
  const { lo, hi } = splitLoHi(joined);
  return new Amount({ lo, hi });
};

export const divideAmounts = (dividend: Amount, divider: Amount): BigNumber => {
  if (isZero(divider)) throw new Error('Division by zero');

  const joinedDividend = new BigNumber(joinLoHiAmount(dividend).toString());
  const joinedDivider = new BigNumber(joinLoHiAmount(divider).toString());

  return joinedDividend.dividedBy(joinedDivider);
};

// This function takes a number and formats it in a display-friendly way (en-US locale)
// Examples:
//    2000        -> 2,000
//    2001.1      -> 2,000.1
//    2001.124125 -> 2,001.124
//    0.000012    -> 0.000012
export const displayAmount = (num: number): string => {
  const split = num.toString().split('.');
  const integer = parseInt(split[0]!);
  let decimal = split[1];

  const formattedInt = new Intl.NumberFormat('en-US').format(integer);

  if (!decimal) return formattedInt;

  if (Math.abs(num) >= 1) {
    decimal = decimal.slice(0, 3);
  }

  return `${formattedInt}.${decimal}`;
};

// Takes a number and represents it as a formatted $usd value
//    2000        -> 2,000
//    2001.1      -> 2,000.10
//    2001.124125 -> 2,001.12
//    0.000012    -> 0.00
export const displayUsd = (number: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

const BASIS_POINTS_DENOMINATOR = new BigNumber(100 * 100);

/**
 * Given an amount expressing basis points, returns a decimal representation of
 * the basis points. This makes it easy to multiply by basis points.
 *
 * For example, 325 basis points = 3.25%. Thus,
 * `toBasisPointsAsDecimal(amount)`, where `amount` is an `Amount` totaling
 * `325n`, will return `0.0325`.
 */
export const toBasisPointsAsDecimal = (
  /**
   * An amount expressing basis points -- i.e., one hundredth of one percent.
   *
   * @see https://en.wikipedia.org/wiki/Basis_point
   */
  amount: Amount,
) => {
  const joinedDividend = new BigNumber(joinLoHiAmount(amount).toString());

  return joinedDividend.dividedBy(BASIS_POINTS_DENOMINATOR).toNumber();
};
