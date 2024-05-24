import { AuctionInfo, Filter } from '../../../state/swap/dutch-auction';

export const getFilteredAuctionInfos = (
  auctionInfos: AuctionInfo[],
  filter: Filter,
  fullSyncHeight?: bigint,
): AuctionInfo[] =>
  filter === 'all'
    ? auctionInfos
    : auctionInfos.filter(auctionInfo => {
        if (!fullSyncHeight) return true;
        if (
          !auctionInfo.auction.description?.startHeight ||
          !auctionInfo.auction.description.endHeight
        )
          return false;

        return (
          auctionInfo.auction.state?.seq === 0n &&
          fullSyncHeight >= auctionInfo.auction.description.startHeight &&
          fullSyncHeight <= auctionInfo.auction.description.endHeight
        );
      });
