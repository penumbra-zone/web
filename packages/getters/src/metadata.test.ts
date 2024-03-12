import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { describe, expect, it } from 'vitest';
import {
  getDisplayDenomExponent,
  getStartEpochIndex,
  getValidatorIdentityKeyAsBech32String,
} from './metadata';

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
    const metadata = new Metadata({ display: 'uunbonding_epoch_123_penumbravalid1abc123' });

    expect(getStartEpochIndex(metadata)).toBe(123n);
  });

  it("returns `undefined` for a non-unbonding token's metadata", () => {
    const metadata = new Metadata({ display: 'penumbra' });

    expect(getStartEpochIndex.optional()(metadata)).toBeUndefined();
  });

  it('returns `undefined` for undefined metadata', () => {
    expect(getStartEpochIndex.optional()(undefined)).toBeUndefined();
  });
});

describe('getValidatorIdentityKeyAsBech32String()', () => {
  describe('when passed metadata of a delegation token', () => {
    const metadata = new Metadata({ display: 'delegation_penumbravalid1abc123' });

    it("returns the bech32 representation of the validator's identity key", () => {
      expect(getValidatorIdentityKeyAsBech32String(metadata)).toBe('penumbravalid1abc123');
    });
  });

  describe('when passed metadata of an unbonding token', () => {
    const metadata = new Metadata({ display: 'uunbonding_epoch_123_penumbravalid1abc123' });

    it("returns the bech32 representation of the validator's identity key", () => {
      expect(getValidatorIdentityKeyAsBech32String(metadata)).toBe('penumbravalid1abc123');
    });
  });

  describe('when passed a token unrelated to validators', () => {
    const metadata = new Metadata({ display: 'penumbra' });

    it('returns `undefined`', () => {
      expect(getValidatorIdentityKeyAsBech32String.optional()(metadata)).toBeUndefined();
    });
  });

  describe('when passed undefined', () => {
    it('returns `undefined`', () => {
      expect(getValidatorIdentityKeyAsBech32String.optional()(undefined)).toBeUndefined();
    });
  });
});
