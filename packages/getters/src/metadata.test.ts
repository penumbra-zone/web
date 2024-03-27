import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { describe, expect, it } from 'vitest';
import {
  getDisplayDenomExponent,
  getUnbondingStartHeight,
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

describe('getUnbondingStartHeight()', () => {
  it("gets the unbonding start height, coerced to a `BigInt`, from an unbonding token's asset ID", () => {
    const metadata = new Metadata({ display: 'uunbonding_start_at_123_penumbravalid1abc123' });

    expect(getUnbondingStartHeight(metadata)).toBe(123n);
  });

  it("returns `undefined` for a non-unbonding token's metadata", () => {
    const metadata = new Metadata({ display: 'penumbra' });

    expect(getUnbondingStartHeight.optional()(metadata)).toBeUndefined();
  });

  it('returns `undefined` for undefined metadata', () => {
    expect(getUnbondingStartHeight.optional()(undefined)).toBeUndefined();
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
    const metadata = new Metadata({ display: 'uunbonding_start_at_123_penumbravalid1abc123' });

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
