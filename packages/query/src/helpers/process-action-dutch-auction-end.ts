import { Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import {
  ActionDutchAuctionEnd,
  DutchAuction,
} from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';
import { getAssetId } from '@penumbra-zone/getters/metadata';
import { IndexedDbInterface } from '@penumbra-zone/types/indexed-db';
import { AuctionQuerierInterface } from '@penumbra-zone/types/querier';
import { getAuctionNftMetadata } from '@penumbra-zone/wasm/auction';

const getInputValue = (auction?: DutchAuction) =>
  new Value({
    amount: auction?.state?.inputReserves,
    assetId: auction?.description?.input?.assetId,
  });

const getOutputValue = (auction?: DutchAuction) =>
  new Value({
    amount: auction?.state?.outputReserves,
    assetId: auction?.description?.outputId,
  });

export const processActionDutchAuctionEnd = async (
  action: ActionDutchAuctionEnd,
  auctionQuerier: AuctionQuerierInterface,
  indexedDb: IndexedDbInterface,
) => {
  if (!action.auctionId) {
    return;
  }

  // Always a sequence number of 1 when ending a Dutch auction
  const seqNum = 1n;

  const metadata = getAuctionNftMetadata(action.auctionId, seqNum);
  const auction = await auctionQuerier.auctionStateById(action.auctionId);

  const outstandingReserves = {
    input: getInputValue(auction),
    output: getOutputValue(auction),
  };

  await Promise.all([
    indexedDb.saveAssetsMetadata({ ...metadata, penumbraAssetId: getAssetId(metadata) }),
    indexedDb.upsertAuction(action.auctionId, { seqNum }),
    indexedDb.addAuctionOutstandingReserves(action.auctionId, outstandingReserves),
  ]);
};
