import { describe, expect, test } from 'vitest';
import { calculateBalance } from './calculate-balance';

describe('Calculate balance tests', () => {
  const assetZeroExponent = {
    base: 'cube',
    display: 'cube',
    description: '',
    name: '',
    symbol: '',
    uri: '',
    uriHash: '',
    penumbraAssetId: {
      inner: '6KBVsPINa8gWSHhfH+kAFJC4afEJA3EtuB2HyCqJUws=',
      altBaseDenom: '',
      altBech32: '',
    },
    denomUnits: [
      {
        aliases: [],
        denom: 'cube',
        exponent: 0,
      },
    ],
  };

  const assetWithExponent = {
    base: 'upenumbra',
    display: 'penumbra',
    description: '',
    name: '',
    symbol: '',
    uri: '',
    uriHash: '',
    penumbraAssetId: {
      inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
      altBaseDenom: '',
      altBech32: '',
    },
    denomUnits: [
      {
        aliases: [],
        denom: 'penumbra',
        exponent: 6,
      },
      {
        aliases: [],
        denom: 'mpenumbra',
        exponent: 3,
      },
      {
        aliases: [],
        denom: 'upenumbra',
        exponent: 0,
      },
    ],
  };

  describe('calculateBalance()', () => {
    test('with zero lo and hi and zero exponent', () => {
      const loHi = {
        lo: 0n,
        hi: 0n,
      };

      expect(calculateBalance(loHi, assetZeroExponent)).equal(0);
    });

    test('with zero hi and zero exponent', () => {
      const loHi = {
        lo: 10n,
        hi: 0n,
      };
      expect(calculateBalance(loHi, assetZeroExponent)).equal(10);
    });

    test('with zero lo and zero exponent', () => {
      const loHi = {
        lo: 0n,
        hi: 10n,
      };
      expect(calculateBalance(loHi, assetZeroExponent)).equal(184467440737095500000);
    });

    test('with zero lo and hi and exponent > 0', () => {
      const loHi = {
        lo: 0n,
        hi: 0n,
      };

      expect(calculateBalance(loHi, assetWithExponent)).equal(0);
    });

    test('with zero hi and exponent > 0', () => {
      const loHi = {
        lo: 10000000n,
        hi: 0n,
      };
      expect(calculateBalance(loHi, assetWithExponent)).equal(10);
    });

    test('with zero lo and exponent > 0', () => {
      const loHi = {
        lo: 0n,
        hi: 10n,
      };
      expect(calculateBalance(loHi, assetWithExponent)).equal(184467440737095.53);
    });
  });
});
