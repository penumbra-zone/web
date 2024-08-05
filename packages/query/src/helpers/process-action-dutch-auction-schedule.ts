import { DutchAuctionDescription } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb.js';
import { getAssetId } from '@penumbra-zone/getters/metadata';
import { IndexedDbInterface } from '@penumbra-zone/types/indexed-db';
import { getAuctionId, getAuctionNftMetadata } from '@penumbra-zone/wasm/auction';

export const processActionDutchAuctionSchedule = async (
  description: DutchAuctionDescription,
  indexedDb: IndexedDbInterface,
) => {
  const auctionId = getAuctionId(description);

  // Always a sequence number of 0 when starting a Dutch auction
  const seqNum = 0n;

  const metadata = getAuctionNftMetadata(auctionId, seqNum);

  await Promise.all([
    indexedDb.saveAssetsMetadata({ ...metadata, penumbraAssetId: getAssetId(metadata) }),
    indexedDb.upsertAuction(auctionId, {
      auction: description,
      seqNum,
    }),
  ]);
};
