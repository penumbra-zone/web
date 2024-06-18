import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getAssetIdFromValueView } from '@penumbra-zone/getters/value-view';
import { getAssetId } from '@penumbra-zone/getters/metadata';

export const hasStakingToken = (
  assetBalances: BalancesResponse[],
  stakingAssetMetadata: Metadata,
): boolean => {
  return assetBalances.some(asset =>
    getAssetIdFromValueView(asset.balanceView).equals(getAssetId(stakingAssetMetadata)),
  );
};
