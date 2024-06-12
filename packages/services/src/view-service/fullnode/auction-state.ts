import {
  AuctionId,
  DutchAuction,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import { Transport, createPromiseClient } from '@connectrpc/connect';
import { AuctionService } from '@penumbra-zone/protobuf';

export const queryAuctionStateById = async (fullnode: Transport, id: AuctionId) => {
  const auctionClient = createPromiseClient(AuctionService, fullnode);

  const dutchAuction = new DutchAuction();

  const { auction } = await auctionClient.auctionStateById({ id });
  if (!auction?.unpackTo(dutchAuction)) return undefined;

  return dutchAuction;
};
