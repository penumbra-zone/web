import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb.js';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';
import { assetIdFromBaseDenom } from '@penumbra-zone/wasm/asset';
import { IndexedDbInterface } from '@penumbra-zone/types/indexed-db';

// Attempts to extract a fee token, with priority in descending order, from the assets used
// in the actions of the transaction planner request (TPR). If no fee token is found from the
// specified assets, it falls back to checking the gas prices table for an asset with a positive balance.
export const extractAltFee = async (
  request: TransactionPlannerRequest,
  indexedDb: IndexedDbInterface,
): Promise<AssetId> => {
  const outputAsset = request.outputs.map(o => o.value?.assetId).find(Boolean);
  if (outputAsset) {
    const assetId = await getAssetFromGasPriceTable(request, indexedDb, outputAsset);
    if (assetId) {
      return assetId;
    }
  }

  const spendAsset = request.spends.map(o => o.value?.assetId).find(Boolean);
  if (spendAsset) {
    const assetId = await getAssetFromGasPriceTable(request, indexedDb, spendAsset);
    if (assetId) {
      return assetId;
    }
  }

  const swapAsset = request.swaps.map(assetIn => assetIn.value?.assetId).find(Boolean);
  if (swapAsset) {
    const assetId = await getAssetFromGasPriceTable(request, indexedDb, swapAsset);
    if (assetId) {
      return assetId;
    }
  }

  const ics20WithdrawAsset = request.ics20Withdrawals.map(w => w.denom).find(Boolean);
  if (ics20WithdrawAsset) {
    const withdrawAsset = assetIdFromBaseDenom(ics20WithdrawAsset.denom);
    const assetId = await getAssetFromGasPriceTable(request, indexedDb, withdrawAsset);
    if (assetId) {
      return assetId;
    }
  }

  const swapCommitment = request.swapClaims
    .map(swapClaim => swapClaim.swapCommitment)
    .find(Boolean);
  if (swapCommitment) {
    const swaps = await indexedDb.getSwapByCommitment(swapCommitment);
    // If the claimFee assetId is undefined, it means the swap was made with the stakingTokenAsset.
    return swaps?.swap?.claimFee?.assetId ?? indexedDb.stakingTokenAssetId;
  }

  const auctionScheduleAsset = request.dutchAuctionScheduleActions
    .map(a => a.description?.input)
    .find(Boolean);
  if (auctionScheduleAsset?.assetId) {
    const inputAssetId = auctionScheduleAsset.assetId;
    const assetId = await getAssetFromGasPriceTable(request, indexedDb, inputAssetId);
    if (assetId) {
      return assetId;
    }
  }

  const auctionEndAsset = request.dutchAuctionEndActions.map(a => a.auctionId).find(Boolean);
  if (auctionEndAsset) {
    const endAuction = await indexedDb.getAuction(auctionEndAsset);
    if (endAuction.auction?.input?.assetId) {
      const inputAssetId = endAuction.auction.input.assetId;
      const assetId = await getAssetFromGasPriceTable(request, indexedDb, inputAssetId);
      if (assetId) {
        return assetId;
      }
    }
  }

  const auctionWithdrawAsset = request.dutchAuctionWithdrawActions
    .map(a => a.auctionId)
    .find(Boolean);
  if (auctionWithdrawAsset) {
    const withdrawAuction = await indexedDb.getAuction(auctionWithdrawAsset);
    if (withdrawAuction.auction?.input?.assetId) {
      const inputAssetId = withdrawAuction.auction.input.assetId;
      const assetId = await getAssetFromGasPriceTable(request, indexedDb, inputAssetId);
      if (assetId) {
        return assetId;
      }
    }
  }

  if (request.undelegations.length > 0) {
    const assetId = await getAssetFromGasPriceTable(request, indexedDb);
    if (assetId) {
      return assetId;
    }
  }

  throw new Error('Not able to pay fee for transaction');
};

// Attempts to find an alternative fee token for a transaction by checking the user's balance of
// various gas price assets. It queries the IndexedDb for alternative gas prices and iterates
// through them, returning the asset ID of the first asset for which the user has a balance.
export const getAssetFromGasPriceTable = async (
  request: TransactionPlannerRequest,
  indexedDb: IndexedDbInterface,
  specificAssetId?: AssetId,
): Promise<AssetId | undefined> => {
  const altGasPrices = await indexedDb.getAltGasPrices();

  // If a specific asset ID is provided, check its balance is positive and GasPrices for that asset are set.
  if (specificAssetId) {
    const balance = await indexedDb.hasTokenBalance(request.source!, specificAssetId);
    const filteredGasPrices = altGasPrices.filter(gp => gp.assetId?.equals(specificAssetId));
    if (balance && filteredGasPrices.length > 0) {
      return specificAssetId;
    }
  }

  // If no specific asset ID is provided or if the specific asset ID has no balance, check assets in GasPrices table.
  for (const gasPrice of altGasPrices) {
    if (gasPrice.assetId) {
      const balance = await indexedDb.hasTokenBalance(request.source!, gasPrice.assetId);
      if (balance) {
        return gasPrice.assetId;
      }
    }
  }

  return undefined;
};
