import { describe, expect, it } from 'vitest';
import {
  addAmounts,
  displayAmount,
  displayUsd,
  fromBaseUnitAmount,
  fromBaseUnitAmountAndMetadata,
  joinLoHiAmount,
} from './amount';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1alpha1/num_pb';
import {
  Metadata,
  ValueView_KnownAssetId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';

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

  it('fromBaseUnitAmountAndMetadata works', () => {
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

    const result = fromBaseUnitAmountAndMetadata(
      new ValueView_KnownAssetId({
        amount: { lo: 123456789n, hi: 0n },
        metadata: penumbraMetadata,
      }),
    );

    expect(result.toString()).toBe('123.456789');
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

describe('Formatting', () => {
  describe('displayAmount()', () => {
    it('no decimals', () => {
      expect(displayAmount(2000)).toBe('2,000');
    });

    it('one decimal place', () => {
      expect(displayAmount(2001.1)).toBe('2,001.1');
    });

    it('many decimals, if above 1, rounds to three places', () => {
      expect(displayAmount(2001.124125)).toBe('2,001.124');
    });

    it('many decimals, if less than 1, shows all places', () => {
      expect(displayAmount(0.000012)).toBe('0.000012');
    });

    it('negative numbers work too', () => {
      expect(displayAmount(-2001.124125)).toBe('-2,001.124');
    });
  });

  describe('displayUsd()', () => {
    it('should format numbers with no decimals', () => {
      expect(displayUsd(2000)).toBe('2,000.00');
    });

    it('should format numbers with one decimal place', () => {
      expect(displayUsd(2001.1)).toBe('2,001.10');
    });

    it('should format numbers with two decimal places', () => {
      expect(displayUsd(2001.12)).toBe('2,001.12');
    });

    it('should round numbers with more than two decimal places', () => {
      expect(displayUsd(2001.124)).toBe('2,001.12');
      expect(displayUsd(2001.125)).toBe('2,001.13'); // testing rounding
    });

    it('should format numbers less than one', () => {
      expect(displayUsd(0.1)).toBe('0.10');
      expect(displayUsd(0.01)).toBe('0.01');
      expect(displayUsd(0.001)).toBe('0.00'); // testing rounding
    });

    it('should format negative numbers', () => {
      expect(displayUsd(-2001)).toBe('-2,001.00');
      expect(displayUsd(-2001.1)).toBe('-2,001.10');
      expect(displayUsd(-2001.12)).toBe('-2,001.12');
      expect(displayUsd(-2001.125)).toBe('-2,001.13'); // testing rounding
    });
  });
});
