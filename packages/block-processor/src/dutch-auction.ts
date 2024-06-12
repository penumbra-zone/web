import { Value } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import {
  ActionDutchAuctionEnd,
  AuctionId,
  DutchAuction,
  DutchAuctionDescription,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import type { PenumbraDb } from '@penumbra-zone/idb';
import { getAuctionId, getAuctionNftMetadata } from '@penumbra-zone/wasm/auction';

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
  auctionStateById: (auctionId: AuctionId) => Promise<DutchAuction | undefined>,
  indexedDb: PenumbraDb,
) => {
  if (!action.auctionId) return;

  // Always a sequence number of 1 when ending a Dutch auction
  const seqNum = 1n;

  const metadata = getAuctionNftMetadata(action.auctionId, seqNum);
  const auction = await auctionStateById(action.auctionId);

  const outstandingReserves = {
    input: getInputValue(auction),
    output: getOutputValue(auction),
  };

  await Promise.all([
    indexedDb.saveAssetsMetadata(metadata),
    indexedDb.upsertAuction(action.auctionId, { seqNum }),
    indexedDb.addAuctionOutstandingReserves(action.auctionId, outstandingReserves),
  ]);
};
export const processActionDutchAuctionWithdraw = async (
  auctionId: AuctionId,
  seqNum: bigint,
  indexedDb: PenumbraDb,
) => {
  const metadata = getAuctionNftMetadata(auctionId, seqNum);

  await Promise.all([
    indexedDb.saveAssetsMetadata(metadata),
    indexedDb.upsertAuction(auctionId, {
      seqNum,
    }),
    indexedDb.deleteAuctionOutstandingReserves(auctionId),
  ]);
};
export const processActionDutchAuctionSchedule = async (
  description: DutchAuctionDescription,
  indexedDb: PenumbraDb,
) => {
  const auctionId = getAuctionId(description);

  // Always a sequence number of 0 when starting a Dutch auction
  const seqNum = 0n;

  const metadata = getAuctionNftMetadata(auctionId, seqNum);

  await Promise.all([
    indexedDb.saveAssetsMetadata(metadata),
    indexedDb.upsertAuction(auctionId, {
      auction: description,
      seqNum,
    }),
  ]);
};
