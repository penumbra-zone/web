import { describe, expect, it } from 'vitest';
import { create } from '@bufbuild/protobuf';
import { getFilteredAuctionInfos } from './get-filtered-auction-infos';
import {
  AuctionIdSchema,
  DutchAuctionSchema,
} from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';
import { AuctionInfo } from '../../../fetchers/auction-infos';
import { AddressIndexSchema } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

const MOCK_AUCTION_1 = create(DutchAuctionSchema, {
  description: {
    startHeight: 11n,
    endHeight: 20n,
  },
  state: {
    seq: 0n,
  },
});
const MOCK_AUCTION_ID_1 = create(AuctionIdSchema, { inner: new Uint8Array([1]) });

const MOCK_AUCTION_INFO_1: AuctionInfo = {
  auction: MOCK_AUCTION_1,
  id: MOCK_AUCTION_ID_1,
  localSeqNum: 0n,
  addressIndex: create(AddressIndexSchema, { account: 0 }),
};

const MOCK_AUCTION_2 = create(DutchAuctionSchema, {
  state: {
    seq: 1n,
  },
});
const MOCK_AUCTION_ID_2 = create(AuctionIdSchema, { inner: new Uint8Array([2]) });
const MOCK_AUCTION_INFO_2: AuctionInfo = {
  auction: MOCK_AUCTION_2,
  id: MOCK_AUCTION_ID_2,
  localSeqNum: 1n,
  addressIndex: create(AddressIndexSchema, { account: 0 }),
};

const MOCK_AUCTION_3 = create(DutchAuctionSchema, {
  state: {
    seq: 1n,
  },
});
const MOCK_AUCTION_ID_3 = create(AuctionIdSchema, { inner: new Uint8Array([3]) });
const MOCK_AUCTION_INFO_3: AuctionInfo = {
  auction: MOCK_AUCTION_3,
  id: MOCK_AUCTION_ID_3,
  localSeqNum: 1n,
  addressIndex: create(AddressIndexSchema, { account: 0 }),
};

const MOCK_AUCTION_4 = create(DutchAuctionSchema, {
  state: {
    seq: 2n,
  },
});
const MOCK_AUCTION_ID_4 = create(AuctionIdSchema, { inner: new Uint8Array([4]) });
const MOCK_AUCTION_INFO_4: AuctionInfo = {
  auction: MOCK_AUCTION_4,
  id: MOCK_AUCTION_ID_4,
  localSeqNum: 2n,
  addressIndex: create(AddressIndexSchema, { account: 0 }),
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
