import { describe, expect, it } from 'vitest';
import { getFilteredAuctionInfos } from './get-filtered-auction-infos';
import {
  AuctionId,
  DutchAuction,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import { AuctionInfo } from '../../../fetchers/auction-infos';

const MOCK_AUCTION_1 = new DutchAuction({
  description: {
    startHeight: 11n,
    endHeight: 20n,
  },
  state: {
    seq: 0n,
  },
});
const MOCK_AUCTION_ID_1 = new AuctionId({ inner: new Uint8Array([1]) });
const MOCK_AUCTION_INFO_1: AuctionInfo = {
  auction: MOCK_AUCTION_1,
  id: MOCK_AUCTION_ID_1,
};

const MOCK_AUCTION_2 = new DutchAuction({
  description: {
    startHeight: 11n,
    endHeight: 20n,
  },
  state: {
    seq: 1n,
  },
});
const MOCK_AUCTION_ID_2 = new AuctionId({ inner: new Uint8Array([2]) });
const MOCK_AUCTION_INFO_2: AuctionInfo = {
  auction: MOCK_AUCTION_2,
  id: MOCK_AUCTION_ID_2,
};

const MOCK_AUCTION_3 = new DutchAuction({
  description: {
    startHeight: 1n,
    endHeight: 10n,
  },
  state: {
    seq: 0n,
  },
});
const MOCK_AUCTION_ID_3 = new AuctionId({ inner: new Uint8Array([3]) });
const MOCK_AUCTION_INFO_3: AuctionInfo = {
  auction: MOCK_AUCTION_3,
  id: MOCK_AUCTION_ID_3,
};

const MOCK_AUCTION_4 = new DutchAuction({
  description: {
    startHeight: 21n,
    endHeight: 30n,
  },
  state: {
    seq: 0n,
  },
});
const MOCK_AUCTION_ID_4 = new AuctionId({ inner: new Uint8Array([4]) });
const MOCK_AUCTION_INFO_4: AuctionInfo = {
  auction: MOCK_AUCTION_4,
  id: MOCK_AUCTION_ID_4,
};

const MOCK_FULL_SYNC_HEIGHT = 15n;

const AUCTION_INFOS: AuctionInfo[] = [
  MOCK_AUCTION_INFO_1,
  MOCK_AUCTION_INFO_2,
  MOCK_AUCTION_INFO_3,
  MOCK_AUCTION_INFO_4,
];

describe('getFilteredAuctionInfos()', () => {
  describe('when the `filter` is `all`', () => {
    it('returns the `auctionInfos` array as-is', () => {
      expect(getFilteredAuctionInfos(AUCTION_INFOS, 'all', MOCK_FULL_SYNC_HEIGHT)).toBe(
        AUCTION_INFOS,
      );
    });
  });

  describe('when the `filter` is `active`', () => {
    it('includes active auctions', () => {
      expect(getFilteredAuctionInfos(AUCTION_INFOS, 'active', MOCK_FULL_SYNC_HEIGHT)).toContain(
        MOCK_AUCTION_INFO_1,
      );
    });

    it('filters out auctions with a nonzero `seq`', () => {
      expect(getFilteredAuctionInfos(AUCTION_INFOS, 'active', MOCK_FULL_SYNC_HEIGHT)).not.toContain(
        MOCK_AUCTION_INFO_2,
      );
    });

    it('filters out auctions that end before `fullSyncHeight`', () => {
      expect(getFilteredAuctionInfos(AUCTION_INFOS, 'active', MOCK_FULL_SYNC_HEIGHT)).not.toContain(
        MOCK_AUCTION_INFO_3,
      );
    });

    it('filters out auctions that start after `fullSyncHeight`', () => {
      expect(getFilteredAuctionInfos(AUCTION_INFOS, 'active', MOCK_FULL_SYNC_HEIGHT)).not.toContain(
        MOCK_AUCTION_INFO_4,
      );
    });

    it('filters out everything if `fullSyncHeight` is undefined', () => {
      expect(getFilteredAuctionInfos(AUCTION_INFOS, 'active', undefined)).toEqual([]);
    });
  });

  describe('when the `filter` is `upcoming`', () => {
    it('filters out active auctions', () => {
      expect(
        getFilteredAuctionInfos(AUCTION_INFOS, 'upcoming', MOCK_FULL_SYNC_HEIGHT),
      ).not.toContain(MOCK_AUCTION_INFO_1);
    });

    it('filters out auctions with a nonzero `seq`', () => {
      expect(
        getFilteredAuctionInfos(AUCTION_INFOS, 'upcoming', MOCK_FULL_SYNC_HEIGHT),
      ).not.toContain(MOCK_AUCTION_INFO_2);
    });

    it('filters out auctions that end before `fullSyncHeight`', () => {
      expect(
        getFilteredAuctionInfos(AUCTION_INFOS, 'upcoming', MOCK_FULL_SYNC_HEIGHT),
      ).not.toContain(MOCK_AUCTION_INFO_3);
    });

    it('includes auctions that start after `fullSyncHeight`', () => {
      expect(getFilteredAuctionInfos(AUCTION_INFOS, 'upcoming', MOCK_FULL_SYNC_HEIGHT)).toContain(
        MOCK_AUCTION_INFO_4,
      );
    });

    it('filters out everything if `fullSyncHeight` is undefined', () => {
      expect(getFilteredAuctionInfos(AUCTION_INFOS, 'upcoming', undefined)).toEqual([]);
    });
  });
});
