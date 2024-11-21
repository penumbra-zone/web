import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';

/**
 * Calculates the display price based on the base price and display exponents.
 */
export const calculateDisplayPrice = (
  baseCalculatedPrice: number,
  baseMetadata: Metadata,
  quoteMetadata: Metadata,
): number => {
  const baseExponent = getDisplayDenomExponent(baseMetadata);
  const quoteExponent = getDisplayDenomExponent(quoteMetadata);

  const exponentDifference = quoteExponent - baseExponent;

  if (exponentDifference >= 0) {
    const multiplier = Math.pow(10, -exponentDifference);
    return baseCalculatedPrice * multiplier;
  } else {
    const divisor = Math.pow(10, exponentDifference);
    return baseCalculatedPrice / divisor;
  }
};
