import { DenomMetadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';

/**
 * Returns the exponent for a given asset type's display denom unit, given that
 * denom's metadata.
 *
 * `DenomMetadata`s have an array of `DenomUnit`s, describing the exponent of
 * each denomination in relation to the base unit. For example, upenumbra is
 * penumbra's base unit -- the unit which can not be further divided into
 * decimals. 1 penumbra is equal to 1,000,000 (AKA, 10 to the 6th) upenumbra, so
 * penumbra's display exponent -- the exponent used to multiply the base unit
 * when displaying a penumbra value to a user -- is 6. (For a non-crypto
 * example, think of US dollars. The dollar is the display unit; the cent is the
 * base unit; the display exponent is 2 (10 to the 2nd).)
 */
export const getDisplayDenomExponent = (denomMetadata: DenomMetadata): number | undefined =>
  denomMetadata.denomUnits.find(denomUnit => denomUnit.denom === denomMetadata.display)?.exponent;
