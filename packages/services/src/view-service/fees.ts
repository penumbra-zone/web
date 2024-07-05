import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { assetIdFromBaseDenom } from '@penumbra-zone/wasm/asset';
import { IndexedDbInterface } from '@penumbra-zone/types/indexed-db';

// Attempts to extract a fee token, with priority in descending order, from the assets used
// in the actions of the planner request.
export const extractAltFee = async (
  request: TransactionPlannerRequest,
  indexedDb: IndexedDbInterface,
): Promise<AssetId> => {
  const outputAsset = request.outputs.map(o => o.value?.assetId).find(Boolean);
  if (outputAsset) return outputAsset;

  const spendAsset = request.spends.map(o => o.value?.assetId).find(Boolean);
  if (spendAsset) return spendAsset;

  const swapAsset = request.swaps.map(assetIn => assetIn.value?.assetId).find(Boolean);
  if (swapAsset) return swapAsset;

  const ics20WithdrawAsset = request.ics20Withdrawals.map(w => w.denom).find(Boolean);
  if (ics20WithdrawAsset) return assetIdFromBaseDenom(ics20WithdrawAsset.denom);

  const swapCommitment = request.swapClaims
    .map(swapClaim => swapClaim.swapCommitment)
    .find(Boolean);

  if (swapCommitment) {
    const swaps = await indexedDb.getSwapByCommitment(swapCommitment);
    // If the claimFee assetId is undefined, it means the swap was made with the stakingTokenAsset
    return swaps?.swap?.claimFee?.assetId ?? indexedDb.stakingTokenAssetId;
  }

  throw new Error('Could not extract alternative fee assetId from TransactionPlannerRequest');
};
