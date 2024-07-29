import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb.js';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';
import { assetIdFromBaseDenom } from '@penumbra-zone/wasm/asset';
import { IndexedDbInterface } from '@penumbra-zone/types/indexed-db';

// Attempts to extract a fee token, with priority in descending order, from the assets used
// in the actions of the transaction planner request (TPR).
//
// (1) For outputs, spends, swaps, scheduling auctions, and ICS withdrawals, the naive approach
// of "using the first alternative token for which the user has a balance" is similar to "extracting
// the input asset from the transaction request". While both methods aim to retrieve an alternative
// fee token, they may result in selecting different tokens.
//
// (2) Swap claims are a special case where the claim must use the swap's fee token.
//
// (3) Ending and withdrawing auctions are another special case that requires a database query to
// retrieve the relevant auction and the corresponding asset ID used in that auction. For example,
// if a Dutch auction is scheduled with a fee paid using GM, ending and withdrawing the auction will
// also attempt to use GM. However, if the user spends their entire GM balance after scheduling the
// auction, they won't be able to end or withdraw it because it expects GM to pay for fees. In this
// scenario, the fee system will use the first available alternative token balance from the
// GAS_PRICES IndexedDB table. This allows the user to end and withdraw auctions using another asset,
// such as GN, if GM is unavailable.
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
      const checkAssetBalance = await indexedDb.hasTokenBalance(
        request.source,
        endAuction.auction.input.assetId,
      );
      if (checkAssetBalance) {
        return endAuction.auction.input.assetId;
      } else {
        const assetId = await getAssetFromGasPriceTable(request, indexedDb);
        if (assetId) {
          return assetId;
        }
      }
    }
  }

  const auctionWithdrawAsset = request.dutchAuctionWithdrawActions
    .map(a => a.auctionId)
    .find(Boolean);
  if (auctionWithdrawAsset) {
    const withdrawAuction = await indexedDb.getAuction(auctionWithdrawAsset);
    if (withdrawAuction.auction?.input?.assetId) {
      const checkAssetBalance = await indexedDb.hasTokenBalance(
        request.source,
        withdrawAuction.auction.input.assetId,
      );
      if (checkAssetBalance) {
        return withdrawAuction.auction.input.assetId;
      } else {
        const assetId = await getAssetFromGasPriceTable(request, indexedDb);
        if (assetId) {
          return assetId;
        }
      }
    }
  }

  if (request.undelegations.length > 0) {
    const assetId = await getAssetFromGasPriceTable(request, indexedDb);
    if (assetId) {
      return assetId;
    }
  }

  throw new Error('Could not extract alternative fee assetId from TransactionPlannerRequest');
};

// Attempts to find an alternative fee token for a transaction by checking the user's balance of
// various gas price assets. It queries the IndexedDb for alternative gas prices and iterates
// through them, returning the asset ID of the first asset for which the user has a balance.
export const getAssetFromGasPriceTable = async (
  request: TransactionPlannerRequest,
  indexedDb: IndexedDbInterface,
): Promise<AssetId | undefined> => {
  const altGasPrices = await indexedDb.getAltGasPrices();
  for (const gasPrice of altGasPrices) {
    if (gasPrice.assetId) {
      const balance = await indexedDb.hasTokenBalance(request.source, gasPrice.assetId);
      if (balance) {
        return gasPrice.assetId;
      }
    }
  }
  return undefined;
};
