import { describe, expect, it } from 'vitest';
import { getFilteredAuctionInfos } from './get-filtered-auction-infos';
import {
  AuctionId,
  DutchAuction,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb.js';
import { AuctionInfo } from '../../../fetchers/auction-infos';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb.js';

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
  localSeqNum: 0n,
  addressIndex: new AddressIndex({ account: 0 }),
};

const MOCK_AUCTION_2 = new DutchAuction({
  state: {
    seq: 1n,
  },
});
const MOCK_AUCTION_ID_2 = new AuctionId({ inner: new Uint8Array([2]) });
const MOCK_AUCTION_INFO_2: AuctionInfo = {
  auction: MOCK_AUCTION_2,
  id: MOCK_AUCTION_ID_2,
  localSeqNum: 1n,
  addressIndex: new AddressIndex({ account: 0 }),
};

const MOCK_AUCTION_3 = new DutchAuction({
  state: {
    seq: 1n,
  },
});
const MOCK_AUCTION_ID_3 = new AuctionId({ inner: new Uint8Array([3]) });
const MOCK_AUCTION_INFO_3: AuctionInfo = {
  auction: MOCK_AUCTION_3,
  id: MOCK_AUCTION_ID_3,
  localSeqNum: 1n,
  addressIndex: new AddressIndex({ account: 0 }),
};

const MOCK_AUCTION_4 = new DutchAuction({
  state: {
    seq: 2n,
  },
});
const MOCK_AUCTION_ID_4 = new AuctionId({ inner: new Uint8Array([4]) });
const MOCK_AUCTION_INFO_4: AuctionInfo = {
  auction: MOCK_AUCTION_4,
  id: MOCK_AUCTION_ID_4,
  localSeqNum: 2n,
  addressIndex: new AddressIndex({ account: 0 }),
};

const AUCTION_INFOS: AuctionInfo[] = [
  MOCK_AUCTION_INFO_1,
  MOCK_AUCTION_INFO_2,
  MOCK_AUCTION_INFO_3,
  MOCK_AUCTION_INFO_4,
];

describe('getFilteredAuctionInfos()', () => {
  describe('when the `filter` is `all`', () => {
    it('returns the `auctionInfos` array as-is', () => {
      expect(getFilteredAuctionInfos(AUCTION_INFOS, 'all')).toBe(AUCTION_INFOS);
    });
  });

  describe('when the `filter` is `active`', () => {
    it('includes active auctions', () => {
      expect(getFilteredAuctionInfos(AUCTION_INFOS, 'active')).toContain(MOCK_AUCTION_INFO_1);
    });

    it('filters out auctions with a `seq`>=2', () => {
      expect(getFilteredAuctionInfos(AUCTION_INFOS, 'active')).not.toContain(MOCK_AUCTION_INFO_4);
    });
  });
  describe('when the `filter` is `inactive`', () => {
    it('includes inactive auctions', () => {
      expect(getFilteredAuctionInfos(AUCTION_INFOS, 'inactive')).toContain(MOCK_AUCTION_INFO_4);
    });

    it('filters out auctions with a `seq`<2', () => {
      expect(getFilteredAuctionInfos(AUCTION_INFOS, 'inactive')).not.toContain(MOCK_AUCTION_INFO_1);
    });
  });
});
