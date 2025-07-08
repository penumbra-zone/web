import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { useStakingTokenMetadata } from '@/shared/api/registry';

/**
 * Checks if any of the provided assets is eligible for rewards in liquidity tournament.
 * Only IBC assets are eligible.
 */
export const useIsLqtEligible = (
  asset1: Metadata | undefined,
  asset2: Metadata | undefined,
): boolean => {
  const { data: umMetadata } = useStakingTokenMetadata();

  if (!asset1 || !asset2) {
    return false;
  }

  const isOneIBC = assetPatterns.ibc.matches(asset1.base) || assetPatterns.ibc.matches(asset2.base);
  const isOneUm =
    !!asset1.penumbraAssetId?.equals(umMetadata.penumbraAssetId) ||
    !!asset2.penumbraAssetId?.equals(umMetadata.penumbraAssetId);

  return isOneIBC && isOneUm;
};
