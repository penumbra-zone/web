import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getMetadataFromBalancesResponseOptional } from '@penumbra-zone/getters/balances-response';

export type BalanceOrMetadata = BalancesResponse | Metadata;

export const isMetadata = (asset: BalancesResponse | Metadata): asset is Metadata => {
  return asset.getType().typeName === Metadata.typeName;
};

export const isBalance = (asset: BalancesResponse | Metadata): asset is BalancesResponse => {
  return asset.getType().typeName === BalancesResponse.typeName;
};

export const mergeBalancesAndAssets = (
  balances: BalancesResponse[] = [],
  assets: Metadata[] = [],
): BalanceOrMetadata[] => {
  const filteredAssets = assets.filter(asset => {
    return !balances.some(balance => {
      const balanceMetadata = getMetadataFromBalancesResponseOptional(balance);
      return balanceMetadata?.equals(asset);
    });
  });
  return [...balances, ...filteredAssets];
};
