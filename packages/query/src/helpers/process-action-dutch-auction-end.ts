import { Value } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ActionDutchAuctionEnd } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1alpha1/auction_pb';
import { IndexedDbInterface } from '@penumbra-zone/types/indexed-db';
import { AuctionQuerierInterface } from '@penumbra-zone/types/querier';
import { getAuctionNftMetadata } from '@penumbra-zone/wasm/auction';

export const processActionDutchAuctionEnd = async (
  action: ActionDutchAuctionEnd,
  auctionQuerier: AuctionQuerierInterface,
  indexedDb: IndexedDbInterface,
) => {
  if (!action.auctionId) return;

  // Always a sequence number of 1 when ending a Dutch auction
  const seqNum = 1n;

  const metadata = getAuctionNftMetadata(action.auctionId, seqNum);
  const auction = await auctionQuerier.auctionStateById(action.auctionId);

  const outstandingReserves = [];
  if (auction?.state?.inputReserves) {
    outstandingReserves.push(
      new Value({
        amount: auction.state.inputReserves,
        assetId: auction.description?.input?.assetId,
      }),
    );
  }

  if (auction?.state?.outputReserves) {
    outstandingReserves.push(
      new Value({
        amount: auction.state.outputReserves,
        assetId: auction.description?.outputId,
      }),
    );
  }

  await Promise.all([
    indexedDb.saveAssetsMetadata(metadata),
    indexedDb.upsertAuction(action.auctionId, { seqNum, outstandingReserves }),
  ]);
};
