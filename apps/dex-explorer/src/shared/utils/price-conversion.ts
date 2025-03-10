import { Metadata, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { toValueView } from './value-view';

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

/**
 * Calculates USDC-normalized amounts for trading pair values (volume or liquidity)
 */
export function calculateEquivalentInUSDC(
  liquidityOrVolume: number,
  usdcPrice: number,
  quoteAssetMetadata: Metadata,
  usdcMetadata: Metadata,
): ValueView {
  const expDiff = Math.abs(
    getDisplayDenomExponent(quoteAssetMetadata) - getDisplayDenomExponent(usdcMetadata),
  );

  // TODO: create `pnum.multiply()` utility: https://github.com/penumbra-zone/dex-explorer/issues/231
  const result = liquidityOrVolume * usdcPrice * 10 ** expDiff;

  return toValueView({
    amount: Math.floor(result),
    metadata: quoteAssetMetadata,
  });
}
