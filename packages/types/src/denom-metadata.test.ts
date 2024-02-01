import { DenomMetadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { describe, expect, test } from 'vitest';
import { getDisplayDenomExponent } from './denom-metadata';

describe('getDisplayDenomExponent()', () => {
  test("gets the exponent from the denom unit whose `denom` is equal to the metadata's `display` property", () => {
    const penumbraDenomMetadata = new DenomMetadata({
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

    expect(getDisplayDenomExponent(penumbraDenomMetadata)).toBe(6);
  });
});
