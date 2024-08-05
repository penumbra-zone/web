import { AuctionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb.js';
import { getAssetId } from '@penumbra-zone/getters/metadata';
import { IndexedDbInterface } from '@penumbra-zone/types/indexed-db';
import { getAuctionNftMetadata } from '@penumbra-zone/wasm/auction';

export const processActionDutchAuctionWithdraw = async (
  auctionId: AuctionId,
  seqNum: bigint,
  indexedDb: IndexedDbInterface,
) => {
  const metadata = getAuctionNftMetadata(auctionId, seqNum);

  await Promise.all([
    indexedDb.saveAssetsMetadata({ ...metadata, penumbraAssetId: getAssetId(metadata) }),
    indexedDb.upsertAuction(auctionId, {
      seqNum,
    }),
    indexedDb.deleteAuctionOutstandingReserves(auctionId),
  ]);
};
