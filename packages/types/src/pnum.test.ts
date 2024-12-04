/* eslint-disable no-bitwise -- expected bitwise operations */
import { describe, expect, it } from 'vitest';
import { pnum } from './pnum.js';
import { BigNumber } from 'bignumber.js';

describe('pnum', () => {
  it('should correctly parse and convert a number with decimals', () => {
    const result = pnum(123.456, 3);

    expect(result.toString()).toBe('123.456');
    expect(result.toNumber()).toBe(123.456);
    expect(result.toLoHi().lo).toBe(123456n);
    expect(result.toBigInt()).toBe(123456n);
    expect(result.toBigNumber()).toStrictEqual(new BigNumber('123.456'));
  });

  it('should correctly parse and convert a string with decimals', () => {
    const result = pnum('123456789.01230000', 6);

    expect(result.toString()).toBe('123456789.0123');
    expect(result.toRoundedString()).toBe('123456789.0123');
    expect(result.toRoundedNumber(2)).toBe(123456789.01);
    expect(result.toFormattedString()).toBe('123,456,789.012300');
    expect(result.toFormattedString({ trailingZeros: false })).toBe('123,456,789.0123');
    expect(result.toNumber()).toBe(123456789.0123);
    expect(result.toLoHi().lo).toBe(123456789012300n);
    expect(result.toBigInt()).toBe(123456789012300n);
    expect(result.toBigNumber()).toStrictEqual(new BigNumber('123456789.0123'));
  });

  it('should correctly parse and convert a bigint', () => {
    const result = pnum(9123456789n, 6);

    expect(result.toString()).toBe('9123.456789');
    expect(result.toRoundedString()).toBe('9123.456789');
    expect(result.toRoundedNumber(5)).toBe(9123.45679);
    expect(result.toFormattedString()).toBe('9,123.456789');
    expect(result.toNumber()).toBe(9123.456789);
    expect(result.toLoHi().lo).toBe(9123456789n);
    expect(result.toBigInt()).toBe(9123456789n);
    expect(result.toBigNumber()).toStrictEqual(new BigNumber('9123.456789'));
  });
});
