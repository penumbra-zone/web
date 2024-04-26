import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { createGetter } from './utils/create-getter';
import { assetPatterns } from '@penumbra-zone/constants/src/assets';

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
 * Get the unbonding start height index from the metadata of an unbonding token
 * -- that is, the block height at which unbonding started.
 *
 * For metadata of a non-unbonding token, will return `undefined`.
 */
export const getUnbondingStartHeight = createGetter((metadata?: Metadata) => {
  if (!metadata) return undefined;

  const unbondingMatch = assetPatterns.unbondingToken.capture(metadata.display);

  if (unbondingMatch) {
    const { startAt } = unbondingMatch;
    return BigInt(startAt);
  }

  return undefined;
});

export const getDisplay = createGetter((metadata?: Metadata) => metadata?.display);

export const getSymbol = createGetter((metadata?: Metadata) => metadata?.symbol);
