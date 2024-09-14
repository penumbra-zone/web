import { ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '../prax';
import { GasPrices } from '@penumbra-zone/protobuf/penumbra/core/component/fee/v1/fee_pb';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { getAssetIdFromValueView } from '@penumbra-zone/getters/value-view';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getAddressIndex } from '@penumbra-zone/getters/balances-response';
import { getAssetId } from '@penumbra-zone/getters/metadata';

// Fetches gas prices
export const getGasPrices = async (): Promise<GasPrices[]> => {
  const res = await penumbra.service(ViewService).gasPrices({});
  return res.altGasPrices;
};

// Determines if the user has UM token in their account balances
export const hasStakingToken = (
  balancesResponses?: BalancesResponse[],
  stakingAssetMetadata?: Metadata,
  source?: BalancesResponse,
): boolean => {
  if (!balancesResponses || !stakingAssetMetadata || !source) {
    return false;
  }

  const account = getAddressIndex.optional(source)?.account;
  if (typeof account === 'undefined') {
    return false;
  }

  return balancesResponses.some(
    asset =>
      getAssetIdFromValueView
        .optional(asset.balanceView)
        ?.equals(getAssetId.optional(stakingAssetMetadata)) &&
      getAddressIndex.optional(asset)?.account === account,
  );
};
