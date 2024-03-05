import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { describe, expect, it } from 'vitest';
import { getDisplayDenomExponent, getStartEpochIndex } from './metadata';

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

describe('getStartEpochIndex()', () => {
  it("gets the epoch index, coerced to a `BigInt`, from an unbonding token's asset ID", () => {
    const assetId = new Metadata({ display: 'uunbonding_epoch_123_penumbravalid1abc123' });

    expect(getStartEpochIndex(assetId)).toBe(123n);
  });

  it("returns `undefined` for a non-unbonding token's metadata", () => {
    const assetId = new Metadata({ display: 'penumbra' });

    expect(getStartEpochIndex.optional()(assetId)).toBeUndefined();
  });

  it('returns `undefined` for undefined metadata', () => {
    expect(getStartEpochIndex.optional()(undefined)).toBeUndefined();
  });
});
