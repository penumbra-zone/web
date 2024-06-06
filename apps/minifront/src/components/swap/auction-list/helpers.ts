import { AuctionInfo } from '../../../fetchers/auction-infos';
import { Filter } from '../../../state/swap/dutch-auction';

const byStartHeight =
  (direction: 'ascending' | 'descending') => (a: AuctionInfo, b: AuctionInfo) => {
    if (!a.auction.description?.startHeight || !b.auction.description?.startHeight) return 0;
    if (direction === 'ascending') {
      return Number(a.auction.description.startHeight - b.auction.description.startHeight);
    }
    return Number(b.auction.description.startHeight - a.auction.description.startHeight);
  };

export const SORT_FUNCTIONS: Record<Filter, (a: AuctionInfo, b: AuctionInfo) => number> = {
  all: byStartHeight('ascending'),
  active: byStartHeight('descending'),
  upcoming: byStartHeight('ascending'),
};
