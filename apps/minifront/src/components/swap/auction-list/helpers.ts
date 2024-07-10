import { AuctionInfo } from '../../../fetchers/auction-infos';

export const byStartHeightAscending = (a: AuctionInfo, b: AuctionInfo) => {
  if (!a.auction.description?.startHeight || !b.auction.description?.startHeight) {
    return 0;
  }
  return Number(a.auction.description.startHeight - b.auction.description.startHeight);
};
