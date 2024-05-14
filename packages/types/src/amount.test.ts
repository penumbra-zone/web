import { describe, expect, it } from 'vitest';
import {
  addAmounts,
  divideAmounts,
  formatNumber,
  fromBaseUnitAmount,
  fromString,
  fromValueView,
  isZero,
  joinLoHiAmount,
  multiplyAmountByNumber,
  subtractAmounts,
  toDecimalExchangeRate,
} from './amount';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

describe('lohi helpers', () => {
  it('fromBaseUnitAmount works', () => {
    const result = fromBaseUnitAmount(new Amount({ lo: 1000n, hi: 5n }), 6);
    expect(result.toString()).toBe('92233720368547.75908');
  });

  it('joinLoHiAmount works', () => {
    const lo = 18446744073709551615n;
    const hi = 18446744073709551615n;
    expect(joinLoHiAmount(new Amount({ lo, hi }))).toBe(340282366920938463463374607431768211455n);
  });

  it('fromBaseUnitAmountAndMetadata works for knownAssetId', () => {
    const penumbraMetadata = new Metadata({
      display: 'penumbra',
      denomUnits: [
        {
          denom: 'penumbra',
          exponent: 6,
        },
        {
          denom: 'mpenumbra',
          exponent: 3,
        },
        {
          denom: 'upenumbra',
          exponent: 0,
        },
      ],
    });

    const result = fromValueView(
      new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: { lo: 123456789n, hi: 0n },
            metadata: penumbraMetadata,
          },
        },
      }),
    );

    expect(result.toString()).toBe('123.456789');
  });

  it('fromBaseUnitAmountAndMetadata works for unknownAssetId', () => {
    const result = fromValueView(
      new ValueView({
        valueView: {
          case: 'unknownAssetId',
          value: {
            amount: { lo: 123456789n, hi: 0n },
          },
        },
      }),
    );

    expect(result.toString()).toBe('123456789');
  });
});

describe('addAmounts', () => {
  it('should return an Amount with lo and hi equal to 0 when both inputs are 0', () => {
    const a = new Amount({ lo: 0n, hi: 0n });
    const b = new Amount({ lo: 0n, hi: 0n });

    const result = addAmounts(a, b);

    expect(result.lo).toBe(0n);
    expect(result.hi).toBe(0n);
  });

  it('should correctly add two Amounts where there is no carry from lo to hi', () => {
    const a = new Amount({ lo: 1n, hi: 1n });
    const b = new Amount({ lo: 2n, hi: 2n });

    const result = addAmounts(a, b);

    expect(result.lo).toBe(3n);
    expect(result.hi).toBe(3n);
  });

  it('should correctly add two Amounts where there is carry from lo to hi', () => {
    const a = new Amount({ lo: 18446744073709551615n, hi: 1n }); // max value for a 64-bit integer
    const b = new Amount({ lo: 1n, hi: 2n });

    const result = addAmounts(a, b);

    expect(result.lo).toBe(0n);
    expect(result.hi).toBe(4n);
  });

  it('should correctly add two Amounts where hi is at the maximum value', () => {
    const a = new Amount({ lo: 0n, hi: 18446744073709551615n }); // max value for a 64-bit integer
    const b = new Amount({ lo: 0n, hi: 18446744073709551615n }); // max value for a 64-bit integer

    const result = addAmounts(a, b);

    expect(result.lo).toBe(0n);
    expect(result.hi).toBe(36893488147419103230n); // 2*max value for a 64-bit integer
  });

  it('should return an Amount with maximum lo and hi when both inputs are at their maximum values', () => {
    const a = new Amount({
      lo: 18446744073709551615n,
      hi: 18446744073709551615n,
    }); // max value for a 64-bit integer
    const b = new Amount({
      lo: 18446744073709551615n,
      hi: 18446744073709551615n,
    }); // max value for a 64-bit integer

    const result = addAmounts(a, b);

    expect(result.lo).toBe(18446744073709551614n); // max value for a 64-bit integer - 1
    expect(result.hi).toBe(36893488147419103231n); // 2*max value for a 64-bit integer + 1
  });
});

describe('subtractAmounts', () => {
  it('should return an Amount with lo and hi equal to 0 when both inputs are 0', () => {
    const a = new Amount({ lo: 0n, hi: 0n });
    const b = new Amount({ lo: 0n, hi: 0n });

    const result = subtractAmounts(a, b);

    expect(result.lo).toBe(0n);
    expect(result.hi).toBe(0n);
  });

  it('should correctly subtract two Amounts', () => {
    const a = new Amount({ lo: 2n, hi: 2n });
    const b = new Amount({ lo: 1n, hi: 1n });

    const result = subtractAmounts(a, b);

    expect(result.lo).toBe(1n);
    expect(result.hi).toBe(1n);
  });

  it('should throw an error if minuend is less than subtrahend', () => {
    const a = new Amount({ lo: 1n, hi: 1n });
    const b = new Amount({ lo: 2n, hi: 2n });

    expect(() => subtractAmounts(a, b)).toThrow('Amount cannot be negative');
  });
});

describe('divideAmounts', () => {
  it('should throw an error when dividing by zero', () => {
    const a = new Amount({ lo: 1n, hi: 1n });
    const b = new Amount({ lo: 0n, hi: 0n });

    expect(() => divideAmounts(a, b)).toThrow('Division by zero');
  });

  it('should return 0n if dividend is zero', () => {
    const a = new Amount({ lo: 0n, hi: 0n });
    const b = new Amount({ lo: 18446744073709551615n, hi: 1n });
    const result = divideAmounts(a, b);

    expect(result.isZero()).toBeTruthy();
  });

  it('should return a number without fractions when dividing without remainder', () => {
    const a = new Amount({ lo: 6n, hi: 0n });
    const b = new Amount({ lo: 2n, hi: 0n });
    const result = divideAmounts(a, b);

    expect(result.toNumber()).toBe(3);
  });

  it('should return a number with specified precision', () => {
    const a = new Amount({ lo: 10n, hi: 0n });
    const b = new Amount({ lo: 3n, hi: 0n });
    const result = divideAmounts(a, b);

    expect(result.toFixed(3)).toEqual('3.333');
  });
});

describe('isZero', () => {
  it('works with zero amount', () => {
    const amount = new Amount({ lo: 0n, hi: 0n });
    expect(isZero(amount)).toBeTruthy();
  });

  it('works with negatives', () => {
    const amount = new Amount({ lo: -13n, hi: 1n });
    expect(isZero(amount)).toBeFalsy();
  });

  it('detects hi number presence', () => {
    const amount = new Amount({ lo: 0n, hi: 1n });
    expect(isZero(amount)).toBeFalsy();
  });

  it('detects lo number presence', () => {
    const amount = new Amount({ lo: 20n, hi: 0n });
    expect(isZero(amount)).toBeFalsy();
  });
});

describe('toDecimalExchangeRate()', () => {
  it('correctly expresses the exchange rate as a decimal', () => {
    const amount = new Amount({ hi: 0n, lo: 325_000_000n });
    expect(toDecimalExchangeRate(amount)).toBe(3.25);
  });
});

describe('multiplyAmountByNumber()', () => {
  it('correctly multiplies an amount by a number', () => {
    const amount = new Amount({ hi: 0n, lo: 100n });

    expect(multiplyAmountByNumber(amount, 1.5)).toEqual(
      new Amount({
        hi: 0n,
        lo: 150n,
      }),
    );
  });

  it('rounds when needed, to avoid trying to convert a decimal to a BigInt', () => {
    const amount = new Amount({ hi: 0n, lo: 100n });

    expect(multiplyAmountByNumber(amount, 1.111111111)).toEqual(
      new Amount({
        hi: 0n,
        lo: 111n,
      }),
    );
  });
});

describe('formatNumber', () => {
  it('formats number with zero precision', () => {
    expect(formatNumber(123.456, { precision: 0 })).toBe('123');
  });

  it('formats number with non-zero precision', () => {
    expect(formatNumber(123.456, { precision: 2 })).toBe('123.46');
  });

  it('handles zero value with non-zero precision', () => {
    expect(formatNumber(0, { precision: 2 })).toBe('0');
  });

  it('removes unnecessary trailing zeros', () => {
    expect(formatNumber(123.4, { precision: 3 })).toBe('123.4');
  });

  it('formats negative number correctly', () => {
    expect(formatNumber(-123.456, { precision: 2 })).toBe('-123.46');
  });
});

describe('fromString', () => {
  it('converts a string to an amount', () => {
    const result = fromString('123456');
    const expected = new Amount({ hi: 0n, lo: 123456n });

    expect(result.equals(expected)).toBe(true);
  });

  it('handles an exponent', () => {
    const result = fromString('123.456', 3);
    const expected = new Amount({ hi: 0n, lo: 123456n });

    expect(result.equals(expected)).toBe(true);
  });
});
