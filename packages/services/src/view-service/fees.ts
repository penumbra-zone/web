import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { IndexedDbInterface } from '@penumbra-zone/types/indexed-db';

export const extractAltFee = async (
  request: TransactionPlannerRequest,
  indexedDb: IndexedDbInterface,
): Promise<AssetId> => {
  const outputAsset = request.outputs.map(o => o.value?.assetId).find(Boolean);
  if (outputAsset) return outputAsset;

  const swapAsset = request.swaps.map(assetIn => assetIn.value?.assetId).find(Boolean);
  if (swapAsset) return swapAsset;

  const swapCommitment = request.swapClaims
    .map(swapClaim => swapClaim.swapCommitment)
    .find(commitment => commitment !== undefined);
  if (swapCommitment) {
    const swaps = await indexedDb.getSwapByCommitment(swapCommitment);
    if (swaps?.swap?.tradingPair?.asset1) {
      return swaps.swap.tradingPair.asset1;
    }
  }

  const auctionScheduleAsset = request.dutchAuctionScheduleActions
    .map(a => a.description?.outputId)
    .find(Boolean);
  if (auctionScheduleAsset) return auctionScheduleAsset;

  const auctionEndAsset = request.dutchAuctionEndActions.map(a => a.auctionId?.inner).find(Boolean);
  if (auctionEndAsset) {
    return new AssetId({ inner: auctionEndAsset });
  }

  const auctionWithdrawAsset = request.dutchAuctionWithdrawActions
    .map(a => a.auctionId?.inner)
    .find(Boolean);
  if (auctionWithdrawAsset) {
    return new AssetId({ inner: auctionWithdrawAsset });
  }

  throw new Error('Could not extract alternative fee assetId from TransactionPlannerRequest');
};
