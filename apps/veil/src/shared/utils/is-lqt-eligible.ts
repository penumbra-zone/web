import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { assetPatterns } from '@penumbra-zone/types/assets';

/**
 * Checks if any of the provided assets is eligible for rewards in liquidity tournament.
 * Only IBC assets are eligible.
 */
export const isLqtEligible = (...assets: (Metadata | undefined)[]): boolean => {
  return assets.some(asset => {
    return !!asset && assetPatterns.ibc.matches(asset.base);
  });
};
