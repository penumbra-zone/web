import { Metadata } from '@penumbra-zone/protobuf/types';
import { describe, expect, it } from 'vitest';
import { getDisplayDenomExponent } from './metadata.js';

describe('getDisplayDenomExponent()', () => {
  it("gets the exponent from the denom unit whose `denom` is equal to the metadata's `display` property", () => {
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

    expect(getDisplayDenomExponent(penumbraMetadata)).toBe(6);
  });
});
