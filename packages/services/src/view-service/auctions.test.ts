import { beforeEach, describe, expect, it, vi } from 'vitest';
import { create, equals, fromBinary } from '@bufbuild/protobuf';
import { auctions } from './auctions.js';

import {
  AuctionsRequestSchema,
  AuctionsResponseSchema,
  BalancesResponseSchema,
  SpendableNoteRecordSchema,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

import {
  AuctionIdSchema,
  DutchAuctionSchema,
  DutchAuctionDescriptionSchema,
} from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';
import type { AuctionId } from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';
import { bech32mAuctionId } from '@penumbra-zone/bech32m/pauctid';
import { ViewService } from '@penumbra-zone/protobuf';
import { ServicesInterface } from '@penumbra-zone/types/services';
import { HandlerContext, createContextValues, createHandlerContext } from '@connectrpc/connect';
import { servicesCtx } from '../ctx/prax.js';
import { IndexedDbMock, MockQuerier, MockServices } from '../test-utils.js';
import { StateCommitmentSchema } from '@penumbra-zone/protobuf/penumbra/crypto/tct/v1/tct_pb';
import { ValueSchema } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AmountSchema } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { anyPack } from '@bufbuild/protobuf/wkt';

const AUCTION_ID_1 = create(AuctionIdSchema, { inner: new Uint8Array(Array(32).fill(1)) });
const BECH32M_AUCTION_ID_1 = bech32mAuctionId(AUCTION_ID_1);
const MOCK_AUCTION_1 = create(DutchAuctionDescriptionSchema, {
  startHeight: 0n,
  endHeight: 120n,
});

const AUCTION_ID_2 = create(AuctionIdSchema, { inner: new Uint8Array(Array(32).fill(2)) });
const BECH32M_AUCTION_ID_2 = bech32mAuctionId(AUCTION_ID_2);
const MOCK_AUCTION_2 = create(DutchAuctionDescriptionSchema, {
  startHeight: 120n,
  endHeight: 240n,
});

const AUCTION_ID_3 = create(AuctionIdSchema, { inner: new Uint8Array(Array(32).fill(3)) });
const BECH32M_AUCTION_ID_3 = bech32mAuctionId(AUCTION_ID_3);
const MOCK_AUCTION_3 = create(DutchAuctionDescriptionSchema, {
  startHeight: 240n,
  endHeight: 360n,
});

const AUCTION_ID_4 = create(AuctionIdSchema, { inner: new Uint8Array(Array(32).fill(4)) });
const MOCK_AUCTION_4 = create(DutchAuctionDescriptionSchema, {
  startHeight: 360n,
  endHeight: 480n,
});

const MOCK_SPENDABLE_NOTE_RECORD = create(SpendableNoteRecordSchema, {
  heightCreated: 1234n,
});

vi.mock('./balances', () => ({
  *balances() {
    const auctionsThisUserControls = [
      BECH32M_AUCTION_ID_1,
      BECH32M_AUCTION_ID_2,
      BECH32M_AUCTION_ID_3,
    ];
    for (const bech32mAuctionId of auctionsThisUserControls) {
      yield create(BalancesResponseSchema, {
        balanceView: {
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: { hi: 0n, lo: 1n },
              metadata: {
                base: `auctionnft_0_${bech32mAuctionId}`,
                display: `auctionnft_0_${bech32mAuctionId}`,
                denomUnits: [{ denom: `auctionnft_0_${bech32mAuctionId}`, exponent: 0 }],
                penumbraAssetId: { inner: new Uint8Array([0, 1, 2, 3]) },
                symbol: 'auction(abcd1234...)',
              },
            },
          },
        },
      });
    }
  },
}));

const TEST_DATA = [
  {
    id: AUCTION_ID_1,
    value: {
      auction: MOCK_AUCTION_1,
      noteCommitment: create(StateCommitmentSchema, { inner: new Uint8Array([0, 1, 2, 3]) }),
      seqNum: 0n,
    },
  },
  {
    id: AUCTION_ID_2,
    value: {
      auction: MOCK_AUCTION_2,
      noteCommitment: create(StateCommitmentSchema, { inner: new Uint8Array([0, 1, 2, 3]) }),
      seqNum: 1n,
    },
  },
  {
    id: AUCTION_ID_3,
    value: {
      auction: MOCK_AUCTION_3,
      noteCommitment: create(StateCommitmentSchema, { inner: new Uint8Array([0, 1, 2, 3]) }),
      seqNum: 2n,
    },
  },
  {
    id: AUCTION_ID_4,
    value: {
      auction: MOCK_AUCTION_4,
      noteCommitment: create(StateCommitmentSchema, { inner: new Uint8Array([0, 1, 2, 3]) }),
      seqNum: 0n,
    },
  },
];

describe('Auctions request handler', () => {
  let mockCtx: HandlerContext;
  let mockIndexedDb: IndexedDbMock;
  let mockQuerier: MockQuerier;

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb = {
      getAuction: vi.fn((auctionId: AuctionId) =>
        Promise.resolve(TEST_DATA.find(({ id }) => equals(AuctionIdSchema, auctionId, id))?.value),
      ),
      getSpendableNoteByCommitment: vi.fn().mockResolvedValue(MOCK_SPENDABLE_NOTE_RECORD),
      getAuctionOutstandingReserves: vi.fn().mockResolvedValue(undefined),
    };

    mockQuerier = {
      auction: {
        auctionStateById: vi
          .fn()
          .mockResolvedValue(create(DutchAuctionSchema, { state: { seq: 1234n } })),
      },
    };

    const mockServices = () =>
      Promise.resolve({
        getWalletServices: vi.fn(() =>
          Promise.resolve({
            indexedDb: mockIndexedDb,
            querier: mockQuerier,
          }),
        ) as MockServices['getWalletServices'],
      } as unknown as ServicesInterface);

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.method.auctions,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(servicesCtx, mockServices),
    });
  });

  it('returns auctions', async () => {
    const req = create(AuctionsRequestSchema);
    const results = await Array.fromAsync(auctions(req, mockCtx));

    expect(results[0]).toEqual(
      create(AuctionsResponseSchema, {
        id: AUCTION_ID_1,
        auction: anyPack(
          DutchAuctionSchema,
          create(DutchAuctionSchema, { description: MOCK_AUCTION_1, state: { seq: 0n } }),
        ),
        noteRecord: MOCK_SPENDABLE_NOTE_RECORD,
      }),
    );
  });

  it('excludes auctions not controlled by the current user', async () => {
    const req = create(AuctionsRequestSchema);
    const results = await Array.fromAsync(auctions(req, mockCtx));

    results.forEach(result => {
      expect(result).not.toEqual(
        expect.objectContaining({
          // Auction 4 is included in the response from IndexedDB, but not in
          // the user's balances
          id: AUCTION_ID_4,
        }),
      );
    });
  });

  it('excludes inactive auctions by default', async () => {
    const req = create(AuctionsRequestSchema);
    const results = await Array.fromAsync(auctions(req, mockCtx));

    expect(
      results.some(result =>
        equals(AuctionIdSchema, create(AuctionIdSchema, result.id), AUCTION_ID_2),
      ),
    ).toBe(false);
    expect(
      results.some(result =>
        equals(AuctionIdSchema, create(AuctionIdSchema, result.id), AUCTION_ID_3),
      ),
    ).toBe(false);
  });

  it('includes inactive auctions if `includeInactive` is `true`', async () => {
    const req = create(AuctionsRequestSchema, { includeInactive: true });
    const results = await Array.fromAsync(auctions(req, mockCtx));

    expect(
      results.some(result =>
        equals(AuctionIdSchema, create(AuctionIdSchema, result.id), AUCTION_ID_2),
      ),
    ).toBe(true);
    expect(
      results.some(result =>
        equals(AuctionIdSchema, create(AuctionIdSchema, result.id), AUCTION_ID_3),
      ),
    ).toBe(true);
  });

  it('includes the latest state from the fullnode if `queryLatestState` is `true`', async () => {
    expect.hasAssertions();

    const req = create(AuctionsRequestSchema, { queryLatestState: true });
    const results = await Array.fromAsync(auctions(req, mockCtx));

    results.forEach(result => {
      const dutchAuction = fromBinary(DutchAuctionSchema, result.auction!.value!);

      expect(dutchAuction.state?.seq).toBe(1234n);
    });
  });

  it('includes the outstanding reserves if any exist in the database (i.e., for an ended auction)', async () => {
    expect.hasAssertions();

    mockIndexedDb.getAuctionOutstandingReserves?.mockImplementation((auctionId: AuctionId) => {
      if (equals(AuctionIdSchema, auctionId, AUCTION_ID_2)) {
        return {
          input: create(ValueSchema, { amount: { hi: 0n, lo: 1234n } }),
          output: create(ValueSchema, { amount: { hi: 0n, lo: 5678n } }),
        };
      }

      return undefined;
    });

    const req = create(AuctionsRequestSchema, { includeInactive: true });
    const results = await Array.fromAsync(auctions(req, mockCtx));

    results.forEach(result => {
      const dutchAuction = fromBinary(DutchAuctionSchema, result.auction!.value!);

      if (equals(AuctionIdSchema, AUCTION_ID_2, create(AuctionIdSchema, result.id))) {
        expect(dutchAuction.state?.inputReserves).toEqual(
          create(AmountSchema, { hi: 0n, lo: 1234n }),
        );
        expect(dutchAuction.state?.outputReserves).toEqual(
          create(AmountSchema, { hi: 0n, lo: 5678n }),
        );
      } else {
        expect(dutchAuction.state?.inputReserves).toBeUndefined();
        expect(dutchAuction.state?.outputReserves).toBeUndefined();
      }
    });
  });
});
