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
  return !!auctionInfo.auction.description && !!auctionInfo.auction.state;
};

const auctionIsActive = (auctionInfo: FilterMatchableAuctionInfo, fullSyncHeight: bigint) =>
  auctionInfo.auction.state.seq === 0n &&
  fullSyncHeight >= auctionInfo.auction.description.startHeight &&
  fullSyncHeight <= auctionInfo.auction.description.endHeight;

const auctionIsUpcoming = (auctionInfo: FilterMatchableAuctionInfo, fullSyncHeight: bigint) =>
  auctionInfo.auction.state.seq === 0n &&
  fullSyncHeight < auctionInfo.auction.description.startHeight;

export const getFilteredAuctionInfos = (
  auctionInfos: AuctionInfo[],
  filter: Filter,
  fullSyncHeight?: bigint,
): AuctionInfo[] => {
  if (filter === 'all') return auctionInfos;

  return auctionInfos.filter(auctionInfo => {
    if (!fullSyncHeight) return false;
    if (!haveEnoughDataToDetermineIfAuctionMatchesFilter(auctionInfo)) return false;
    if (filter === 'active') return auctionIsActive(auctionInfo, fullSyncHeight);
    return auctionIsUpcoming(auctionInfo, fullSyncHeight);
  });
};
