import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { IndexedDbInterface } from '@penumbra-zone/types/indexed-db';

// Attempts to extract a fee token, with priority in descending order, from the assets used
// in the actions of the planner request.
export const extractAltFee = async (
  request: TransactionPlannerRequest,
  stakingTokenAssetId: AssetId,
  indexedDb: IndexedDbInterface,
): Promise<AssetId> => {
  const outputAsset = request.outputs.map(o => o.value?.assetId).find(Boolean);
  if (outputAsset) return outputAsset;

  const spendAsset = request.spends.map(o => o.value?.assetId).find(Boolean);
  if (spendAsset) return spendAsset;

  const swapAsset = request.swaps.map(assetIn => assetIn.value?.assetId).find(Boolean);
  if (swapAsset) return swapAsset;

  const swapCommitment = request.swapClaims
    .map(swapClaim => swapClaim.swapCommitment)
    .find(Boolean);
  if (swapCommitment) {
    const swaps = await indexedDb.getSwapByCommitment(swapCommitment);
    if (swaps?.swap?.claimFee?.assetId) {
      return swaps.swap.claimFee.assetId;
    }
    // Use native staking token if asset id for the claim fee is undefined.
    return stakingTokenAssetId;
  }
  
  throw new Error('Could not extract alternative fee assetId from TransactionPlannerRequest');
};
