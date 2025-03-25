import { ViewService } from '@penumbra-zone/protobuf';
import { GasPrices } from '@penumbra-zone/protobuf/penumbra/core/component/fee/v1/fee_pb';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { getAssetIdFromValueView } from '@penumbra-zone/getters/value-view';
import { AssetIdSchema, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getAddressIndex } from '@penumbra-zone/getters/balances-response';
import { penumbra } from '../penumbra';
import { equals } from '@bufbuild/protobuf';

// Fetches gas prices
export const getGasPrices = async (): Promise<GasPrices[]> => {
  const res = await penumbra.service(ViewService).gasPrices({});
  return res.altGasPrices;
};

// Determines if the user has UM token in their account balances
export const hasStakingToken = (
  balancesResponses: BalancesResponse[] | undefined,
  stakingAssetMetadata: Metadata | undefined,
  source: BalancesResponse | undefined,
): boolean => {
  if (!balancesResponses || !stakingAssetMetadata || !source) {
    return false;
  }

  const account = getAddressIndex.optional(source)?.account;
  if (typeof account === 'undefined') {
    return false;
  }

  return balancesResponses.some(asset => {
    const assetId = getAssetIdFromValueView.optional(asset.balanceView);
    const stakingAssetId = getAssetIdFromValueView.optional(asset.balanceView);
    const index = getAddressIndex.optional(asset);
    return (
      stakingAssetId &&
      assetId &&
      equals(AssetIdSchema, assetId, stakingAssetId) &&
      index?.account === account
    );
  });
};
