import { AssetId, TransactionPlannerRequest } from '@penumbra-zone/protobuf/types';
import { assetIdFromBaseDenom } from '@penumbra-zone/wasm/asset';
import { IndexedDbInterface } from '@penumbra-zone/types/indexed-db';

// Attempts to extract a fee token, with priority in descending order, from the assets used
// in the actions of the planner request.
export const extractAltFee = async (
  request: TransactionPlannerRequest,
  indexedDb: IndexedDbInterface,
): Promise<AssetId> => {
  const outputAsset = request.outputs.map(o => o.value?.assetId).find(Boolean);
  if (outputAsset) {
    return outputAsset;
  }

  const spendAsset = request.spends.map(o => o.value?.assetId).find(Boolean);
  if (spendAsset) {
    return spendAsset;
  }

  const swapAsset = request.swaps.map(assetIn => assetIn.value?.assetId).find(Boolean);
  if (swapAsset) {
    return swapAsset;
  }

  const ics20WithdrawAsset = request.ics20Withdrawals.map(w => w.denom).find(Boolean);
  if (ics20WithdrawAsset) {
    return assetIdFromBaseDenom(ics20WithdrawAsset.denom);
  }

  const swapCommitment = request.swapClaims
    .map(swapClaim => swapClaim.swapCommitment)
    .find(Boolean);

  if (swapCommitment) {
    const swaps = await indexedDb.getSwapByCommitment(swapCommitment);
    // If the claimFee assetId is undefined, it means the swap was made with the stakingTokenAsset
    return swaps?.swap?.claimFee?.assetId ?? indexedDb.stakingTokenAssetId;
  }

  const auctionScheduleAsset = request.dutchAuctionScheduleActions
    .map(a => a.description?.input)
    .find(Boolean);
  if (auctionScheduleAsset?.assetId) {
    return auctionScheduleAsset.assetId;
  }

  const auctionEndAsset = request.dutchAuctionEndActions.map(a => a.auctionId).find(Boolean);
  if (auctionEndAsset) {
    const endAuction = await indexedDb.getAuction(auctionEndAsset);
    if (endAuction.auction?.input?.assetId) {
      return endAuction.auction.input.assetId;
    }
  }

  const auctionWithdrawAsset = request.dutchAuctionWithdrawActions
    .map(a => a.auctionId)
    .find(Boolean);
  if (auctionWithdrawAsset) {
    const withdrawAuction = await indexedDb.getAuction(auctionWithdrawAsset);
    if (withdrawAuction.auction?.input?.assetId) {
      return withdrawAuction.auction.input.assetId;
    }
  }

  throw new Error('Could not extract alternative fee assetId from TransactionPlannerRequest');
};
