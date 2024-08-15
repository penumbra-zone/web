import { AuctionInfo } from '../../../fetchers/auction-infos';
import { Filter } from '../../../state/swap/dutch-auction';

type FilterMatchableAuctionInfo = AuctionInfo & {
  auction: {
    description: {
      startHeight: bigint;
      endHeight: bigint;
    };
    state: {
      seq: bigint;
    };
  };
};

const haveEnoughDataToDetermineIfAuctionMatchesFilter = (
  auctionInfo: AuctionInfo,
): auctionInfo is FilterMatchableAuctionInfo => {
  return !!auctionInfo.auction.state;
};

// Dutch auctions move from:
// 0 (opened) => 1 (closed) => n (withdrawn)
const auctionIsActive = (auctionInfo: FilterMatchableAuctionInfo) =>
  auctionInfo.auction.state.seq < 2n;

export const getFilteredAuctionInfos = (
  auctionInfos: AuctionInfo[],
  filter: Filter,
): AuctionInfo[] => {
  if (filter === 'all') {
    return auctionInfos;
  }

  return auctionInfos.filter(auctionInfo => {
    if (!haveEnoughDataToDetermineIfAuctionMatchesFilter(auctionInfo)) {
      return false;
    }
    const isActive = auctionIsActive(auctionInfo);

    return filter === 'active' ? isActive : !isActive;
  });
};
