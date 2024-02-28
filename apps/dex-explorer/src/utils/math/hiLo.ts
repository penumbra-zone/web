// https://github.com/penumbra-zone/web/blob/main/packages/types/src/lo-hi.ts

import BigNumber from "bignumber.js";

BigNumber.config({ EXPONENTIAL_AT: [-20, 20] });

/**
 * In protobufs, it's common to split a single u128 into two u64's.
 *
 *             hi: u64                          lo: u64
 *  ┌───┬───┬───┬───┬───┬───┬───┬───┐ ┌───┬───┬───┬───┬───┬───┬───┬───┐
 *  │   │   │   │   │   │   │   │   │ │   │   │   │   │   │   │   │   │
 *  └───┴───┴───┴───┴───┴───┴───┴───┘ └───┴───┴───┴───┴───┴───┴───┴───┘
 *    15  14  13  12  11  10  9   8     7   6   5   4   3   2   1   0
 */
export interface LoHi {
  lo: bigint;
  hi?: bigint;
}

/**
 * @param {bigint} value - The 128-bit number represented as a bigint.
 * @returns {LoHi} An object with properties `lo` and `hi`, representing the low and high 64 bits of `value`.
 */
export const splitLoHi = (value: bigint): Required<LoHi> => {
  const hi = value >> 64n;
  const lo = value & ((1n << 64n) - 1n);
  return { lo, hi };
};

/**
 * Joins a high order and a low order bigint into a single bigint.
 *
 * The `hi` and `lo` values are expected to represent the high and
 * low 64 bits of a 128-bit number, respectively. The function
 * returns a bigint that combines these two parts.
 * To achieve this, we shift `hi` 8 bytes to the left.
 *
 * @param {bigint} lo - The low order 64 bits of the number.
 * @param {bigint} hi - The high order 64 bits of the number.
 * @returns {bigint} The combined 128-bit number represented as a single bigint.
 */
export const joinLoHi = (lo = 0n, hi = 0n): bigint => {
  return (hi << 64n) + lo;
};

/**
 * Adds two LoHi numbers together
 */
export const addLoHi = (a: LoHi, b: LoHi): Required<LoHi> => {
  const aBigInt = joinLoHi(a.lo, a.hi);
  const bBigInt = joinLoHi(b.lo, b.hi);
  return splitLoHi(aBigInt + bBigInt);
};

/**
 * Denoms have `DenomUnit[]` which provide variations of the denom display name with different exponents:
 * - penumbra, exponent 6
 * - mpenumbra, exponent 3
 * - upenumbra, exponent 0
 * This function allows you to calculate a single BigInt with the exponent applied
 * Note: Often passing exponent 0 is the default given protobuf serialization.
 *       This is treated as 1 instead.
 *
 * @returns BigNumber as javascript's `number` does not have the necessary precision
 */
export const fromBaseUnit = (lo = 0n, hi = 0n, exponent: number): BigNumber => {
  const bigNum = new BigNumber(joinLoHi(lo, hi).toString());
  return bigNum.dividedBy(exponent ? BigNumber(10).pow(exponent) : 1);
};

/**
 * Inverse of fromBaseUnit.
 * Multiplies the given number by 10 to the power of the exponent,
 * and then splits the result into separate lo and hi values.
 *
 * @param {BigNumber} value - The value to be multiplied.
 * @param {number} exponent - The exponent to be applied.
 * @returns {LoHi} An object with properties `lo` and `hi`, representing the low and high 64 bits of the multiplied value.
 */
export const toBaseUnit = (value: BigNumber, exponent = 0): LoHi => {
  const multipliedValue = value.multipliedBy(new BigNumber(10).pow(exponent));
  const bigInt = BigInt(multipliedValue.toFixed());

  return splitLoHi(bigInt);
};
