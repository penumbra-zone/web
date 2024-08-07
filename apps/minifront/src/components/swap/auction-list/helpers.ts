import { AuctionInfo } from '../../../fetchers/auction-infos';

export const filterWithLimit = <T>(
  array: T[],
  predicate: (value: T) => boolean,
  limit: number,
): T[] => {
  const result: T[] = [];
  let count = 0;

  for (const item of array) {
    if (predicate(item)) {
      result.push(item);
      count++;
      if (count >= limit) {
        break;
      }
    }
  }
  return result;
};

export const byStartHeightAscending = (a: AuctionInfo, b: AuctionInfo) => {
  if (!a.auction.description?.startHeight || !b.auction.description?.startHeight) {
    return 0;
  }
  return Number(a.auction.description.startHeight - b.auction.description.startHeight);
};
