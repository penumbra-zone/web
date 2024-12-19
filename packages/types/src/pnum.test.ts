import { describe, expect, it } from 'vitest';
import { pnum } from './pnum.js';
import { BigNumber } from 'bignumber.js';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import {
  DenomUnit,
  Metadata,
  ValueView,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

describe('pnum', () => {
  it('should correctly parse and convert a number with decimals', () => {
    const result = pnum(123.456, { exponent: 3 });

    expect(result.toNumber()).toBe(123.456);
    expect(result.toString()).toBe('123.456');
    expect(result.toBigInt()).toBe(123456n);
    expect(result.toBigNumber()).toStrictEqual(new BigNumber('123.456'));
    expect(result.toLoHi().lo).toBe(123456n);
    expect(result.toAmount()).toStrictEqual(
      new Amount({
        lo: 123456n,
        hi: 0n,
      }),
    );
  });

  it('should correctly parse and convert a string with decimals', () => {
    const result = pnum('123456789.01230000', { exponent: 6 });

    expect(result.toNumber()).toBe(123456789.0123);
    expect(result.toRoundedNumber(2)).toBe(123456789.01);
    expect(result.toString()).toBe('123456789.0123');
    expect(result.toRoundedString()).toBe('123456789.012300');
    expect(result.toFormattedString()).toBe('123,456,789.012300');
    expect(result.toFormattedString({ trailingZeros: false })).toBe('123,456,789.0123');
    expect(result.toBigInt()).toBe(123456789012300n);
    expect(result.toBigNumber()).toStrictEqual(new BigNumber('123456789.0123'));
    expect(result.toLoHi().lo).toBe(123456789012300n);
    expect(result.toAmount()).toStrictEqual(
      new Amount({
        lo: 123456789012300n,
        hi: 0n,
      }),
    );
  });

  it('should correctly parse and convert a bigint', () => {
    const result = pnum(9123456789n, { exponent: 6 });

    expect(result.toNumber()).toBe(9123.456789);
    expect(result.toRoundedNumber(5)).toBe(9123.45679);
    expect(result.toString()).toBe('9123.456789');
    expect(result.toRoundedString()).toBe('9123.456789');
    expect(result.toFormattedString()).toBe('9,123.456789');
    expect(result.toBigInt()).toBe(9123456789n);
    expect(result.toBigNumber()).toStrictEqual(new BigNumber('9123.456789'));
    expect(result.toLoHi().lo).toBe(9123456789n);
    expect(result.toAmount()).toStrictEqual(
      new Amount({
        lo: 9123456789n,
        hi: 0n,
      }),
    );
  });

  it('should correctly parse and convert a LoHi', () => {
    const result = pnum({ lo: 99999n, hi: 99999n }, { exponent: 6 });

    expect(result.toNumber()).toBe(1844655960626881500);
    expect(result.toRoundedNumber(5)).toBe(1844655960626881500);
    expect(result.toString()).toBe('1844655960626881452.148383');
    expect(result.toRoundedString()).toBe('1844655960626881452.148383');
    expect(result.toFormattedString()).toBe('1,844,655,960,626,881,452.148383');
    expect(result.toBigInt()).toBe(1844655960626881452148383n);
    expect(result.toBigNumber()).toStrictEqual(new BigNumber('1844655960626881452.148383'));
    expect(result.toLoHi().lo).toBe(99999n);
    expect(result.toLoHi().hi).toBe(99999n);
    expect(result.toAmount()).toStrictEqual(
      new Amount({
        lo: 99999n,
        hi: 99999n,
      }),
    );
  });

  it('should correctly parse and convert an Amount', () => {
    const result = pnum(
      new Amount({
        lo: 9123456789n,
        hi: 0n,
      }),
      { exponent: 6 },
    );

    expect(result.toNumber()).toBe(9123.456789);
    expect(result.toRoundedNumber(5)).toBe(9123.45679);
    expect(result.toString()).toBe('9123.456789');
    expect(result.toRoundedString()).toBe('9123.456789');
    expect(result.toFormattedString()).toBe('9,123.456789');
    expect(result.toBigInt()).toBe(9123456789n);
    expect(result.toBigNumber()).toStrictEqual(new BigNumber('9123.456789'));
    expect(result.toLoHi().lo).toBe(9123456789n);
    expect(result.toAmount()).toStrictEqual(
      new Amount({
        lo: 9123456789n,
        hi: 0n,
      }),
    );
  });

  it('should correctly parse and convert undefined', () => {
    const result = pnum();

    expect(result.toString()).toBe('0');
    expect(result.toRoundedString(2)).toBe('0.00');
    expect(result.toRoundedNumber(5)).toBe(0);
    expect(result.toFormattedString()).toBe('0');
    expect(result.toNumber()).toBe(0);
    expect(result.toLoHi().lo).toBe(0n);
    expect(result.toBigInt()).toBe(0n);
    expect(result.toBigNumber()).toStrictEqual(new BigNumber('0'));
    expect(result.toAmount()).toStrictEqual(
      new Amount({
        lo: 0n,
        hi: 0n,
      }),
    );
  });

  it('should correctly parse exponent as number or options', () => {
    const result1 = pnum(123455678, 4);
    const result2 = pnum(123455678n, { exponent: 4 });
    const result3 = pnum(123455678n, 4);

    expect(result1.toString()).toBe('123455678');
    expect(result1.toRoundedString()).toBe('123455678.0000');
    expect(result1.toFormattedString()).toBe('123,455,678.0000');

    expect(result2.toFormattedString()).toBe('12,345.5678');
    expect(result2.toFormattedString()).toBe(result3.toFormattedString());
    expect(result3.toString()).toBe('12345.5678');
  });

  it('should correctly convert to ValueView', () => {
    const unknown = pnum(12345.5678, { exponent: 4 }).toValueView();
    const metadata = new Metadata({
      base: 'UM',
      display: 'penumbra',
      denomUnits: [
        new DenomUnit({
          exponent: 0,
          denom: 'UM',
        }),
      ],
    });
    const known = pnum(12345.5678, { exponent: 4 }).toValueView(metadata);

    expect(unknown).toStrictEqual(
      new ValueView({
        valueView: {
          case: 'unknownAssetId',
          value: {
            amount: new Amount({
              lo: 123455678n,
              hi: 0n,
            }),
          },
        },
      }),
    );

    expect(known).toStrictEqual(
      new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: new Amount({
              lo: 123455678n,
              hi: 0n,
            }),
            metadata,
          },
        },
      }),
    );
  });
});
