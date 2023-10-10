import { Asset } from './asset';

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
export const joinLoHi = (lo: bigint, hi = 0n): bigint => {
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
 * @param {Asset} asset - The assert for which you need to find exponent.
 * @returns {LoHi} Asset exponent, if zero return 1.
 */
export const findAssetExponent = (asset: Asset): number => {
  return asset.denomUnits.find(denom => denom.denom === asset.display)?.exponent ?? 0;
};

/**
 * Calculate a high order, a low order  and asset exponent bigint into a single bigint.
 * @param {bigint} lo - The low order 64 bits of the number.
 * @param {bigint} hi - The high order 64 bits of the number.
 * @param {Asset} asset - The assert for which you need to find exponent.
 * @returns {bigint} The combined 128-bit number represented as a single bigint.
 */
export const calculateLoHiExponent = (lo: bigint, hi = 0n, asset: Asset): bigint => {
  const loHi = joinLoHi(lo, hi);
  const exponent = BigInt(findAssetExponent(asset));

  return loHi / (exponent ? 10n ** exponent : 1n);
};
