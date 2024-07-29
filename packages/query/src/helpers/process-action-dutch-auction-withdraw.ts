import { AuctionId } from '@penumbra-zone/protobuf/types';
import { IndexedDbInterface } from '@penumbra-zone/types/indexed-db';
import { getAuctionNftMetadata } from '@penumbra-zone/wasm/auction';

export const processActionDutchAuctionWithdraw = async (
  auctionId: AuctionId,
  seqNum: bigint,
  indexedDb: IndexedDbInterface,
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
