import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { createGetter } from './utils/create-getter';
import {
  DelegationCaptureGroups,
  UnbondingCaptureGroups,
  assetPatterns,
} from '@penumbra-zone/constants';

export const getAssetId = createGetter((metadata?: Metadata) => metadata?.penumbraAssetId);

/**
 * Returns the exponent for a given asset type's display denom unit, given that
 * denom's metadata.
 *
 * `Metadata`s have an array of `DenomUnit`s, describing the exponent of
 * each denomination in relation to the base unit. For example, upenumbra is
 * penumbra's base unit -- the unit which can not be further divided into
 * decimals. 1 penumbra is equal to 1,000,000 (AKA, 10 to the 6th) upenumbra, so
 * penumbra's display exponent -- the exponent used to multiply the base unit
 * when displaying a penumbra value to a user -- is 6. (For a non-crypto
 * example, think of US dollars. The dollar is the display unit; the cent is the
 * base unit; the display exponent is 2 (10 to the 2nd).)
 */
export const getDisplayDenomExponent = createGetter(
  (metadata?: Metadata) =>
    metadata?.denomUnits.find(denomUnit => denomUnit.denom === metadata.display)?.exponent,
);

/**
 * Get the start epoch index from the metadata of an unbonding token -- that is,
 * the epoch at which unbonding started.
 *
 * For metadata of a non-unbonding token, will return `undefined`.
 */
export const getStartEpochIndex = createGetter((metadata?: Metadata) => {
  if (!metadata) return undefined;

  const unbondingMatch = assetPatterns.unbondingToken.exec(metadata.display);

  if (unbondingMatch) {
    const { epoch } = unbondingMatch.groups as unknown as UnbondingCaptureGroups;

    if (epoch) return BigInt(epoch);
  }

  return undefined;
});

/**
 * Get the bech32 representation of a validator's identity key from the metadata
 * of a delegation or unbonding token.
 *
 * For metadata of other token types, will return `undefined`.
 */
export const getValidatorIdentityKeyAsBech32String = createGetter((metadata?: Metadata) => {
  if (!metadata) return undefined;

  const delegationMatch = assetPatterns.delegationToken.exec(metadata.display);
  if (delegationMatch) {
    const { bech32IdentityKey } = delegationMatch.groups as unknown as DelegationCaptureGroups;
    return bech32IdentityKey;
  }

  const unbondingMatch = assetPatterns.unbondingToken.exec(metadata.display);
  if (unbondingMatch) {
    const { bech32IdentityKey } = unbondingMatch.groups as unknown as UnbondingCaptureGroups;
    return bech32IdentityKey;
  }

  return undefined;
});
