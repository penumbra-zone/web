import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

// Attempts to extract a fee token, with priority in descending order, from the assets used
// in the actions of the planner request.
// TODO: expand functionality for other action types like auctions, IBC, governance, etc.
export const extractAltFee = (request: TransactionPlannerRequest): AssetId => {
  const outputAsset = request.outputs.map(o => o.value?.assetId).find(Boolean);
  if (outputAsset) return outputAsset;

  const spendAsset = request.spends.map(o => o.value?.assetId).find(Boolean);
  if (spendAsset) return spendAsset;

  const swapAsset = request.swaps.map(assetIn => assetIn.value?.assetId).find(Boolean);
  if (swapAsset) return swapAsset;

  throw new Error('Could not extract alternative fee assetId from TransactionPlannerRequest');
};
