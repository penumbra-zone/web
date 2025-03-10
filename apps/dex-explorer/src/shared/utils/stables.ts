import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

/**
 * Utility for retrieving stablecoin metadata
 */
export const getStablecoins = (
  allAssets: Metadata[],
  stablecoin: string,
): { stablecoins: Metadata[]; usdc?: Metadata } => {
  const stablecoins = allAssets.filter(asset => ['USDT', 'USDC', 'USDY'].includes(asset.symbol));
  const usdc = stablecoins.find(asset => asset.symbol === stablecoin);
  return { stablecoins, usdc };
};
