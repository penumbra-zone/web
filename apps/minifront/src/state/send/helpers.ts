import { AssetId, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import {
  BalancesResponse,
  TransactionPlannerRequest_Output,
  TransactionPlannerRequest_Spend,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { getDisplay } from '@penumbra-zone/getters/metadata';
import { getAmount, getMetadata } from '@penumbra-zone/getters/value-view';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { isKnown } from '../helpers';
import { AbridgedZQueryState } from '@penumbra-zone/zquery/src/types';
import { chainRegistryClient } from '../../fetchers/registry';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { PartialMessage } from '@bufbuild/protobuf';
import { GasPrices } from '@penumbra-zone/protobuf/penumbra/core/component/fee/v1/fee_pb';

const nonTransferableAssetPatterns = [
  assetPatterns.proposalNft,
  assetPatterns.auctionNft,
  assetPatterns.lpNft,
];

const isTransferable = (metadata: Metadata) =>
  nonTransferableAssetPatterns.every(pattern => !pattern.matches(getDisplay(metadata)));

export const transferableBalancesResponsesSelector = (
  zQueryState: AbridgedZQueryState<BalancesResponse[]>,
) => ({
  loading: zQueryState.loading,
  error: zQueryState.error,
  data: zQueryState.data?.filter(
    balance => isKnown(balance) && isTransferable(getMetadata(balance.balanceView)),
  ),
});

// Check if the selected balance equals the specified amount.
const isMaxAmount = (
  selection: BalancesResponse | undefined,
  spendOrOutput:
    | PartialMessage<TransactionPlannerRequest_Spend>
    | PartialMessage<TransactionPlannerRequest_Output>,
): boolean => {
  return getAmount(selection?.balanceView).equals(spendOrOutput.value?.amount as Amount);
};

// Check if the asset is the native staking token (UM).
const isUmAsset = (
  spendOrOutput:
    | PartialMessage<TransactionPlannerRequest_Spend>
    | PartialMessage<TransactionPlannerRequest_Output>,
): boolean => {
  const { stakingAssetId } = chainRegistryClient.bundled.globals();
  return stakingAssetId.equals(spendOrOutput.value?.assetId as AssetId);
};

// Check whether the asset you're sending is an alternative asset used for fees.
const isAlternativeAssetUsedForFees = (
  spendOrOutput:
    | PartialMessage<TransactionPlannerRequest_Spend>
    | PartialMessage<TransactionPlannerRequest_Output>,
  gasPrices: GasPrices[] | undefined,
): boolean => {
  return (
    gasPrices?.some(price => price.assetId?.equals(spendOrOutput.value?.assetId as AssetId)) ??
    false
  );
};

// Check whether the transaction meets the "send max" conditions, which determines if the request
// should be structured as a "spend" rather than an "output". The way the logic is structured,
// if both invariantOne and invariantTwo are false, isSendingMax will be false, crafting an output
// TPR. However, if either of the invariants is satisfied, a spend TPR will be crafted.
export const checkSendMaxInvariants = ({
  selection,
  spendOrOutput,
  gasPrices,
  stakingToken,
}: {
  selection: BalancesResponse | undefined;
  spendOrOutput:
    | PartialMessage<TransactionPlannerRequest_Spend>
    | PartialMessage<TransactionPlannerRequest_Output>;
  gasPrices: GasPrices[] | undefined;
  stakingToken: boolean | undefined;
}): boolean => {
  // Checks if the transaction involves sending the maximum amount of the native
  // staking token (UM). This condition is met if the selected asset's amount equals the maximum
  // balance and the asset is UM.
  const invariantOne = isUmAsset(spendOrOutput) && isMaxAmount(selection, spendOrOutput);

  // This condition ensures that the transaction is treated as a "send max" operation using a
  // non-native asset for covering fees.
  const invariantTwo =
    !stakingToken &&
    isAlternativeAssetUsedForFees(spendOrOutput, gasPrices) &&
    isMaxAmount(selection, spendOrOutput);

  const isSendingMax = invariantOne || invariantTwo;

  return isSendingMax;
};
