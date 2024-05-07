import Array from '@penumbra-zone/polyfills/Array.fromAsync';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { auctions } from './auctions';
import {
  AuctionsRequest,
  AuctionsResponse,
  BalancesResponse,
  SpendableNoteRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import {
  AuctionId,
  DutchAuction,
  DutchAuctionDescription,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1alpha1/auction_pb';
import { bech32mAuctionId } from '@penumbra-zone/bech32m/pauctid';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { ServicesInterface } from '@penumbra-zone/types/services';
import { HandlerContext, createContextValues, createHandlerContext } from '@connectrpc/connect';
import { servicesCtx } from '../ctx/prax';
import { IndexedDbMock, MockQuerier, MockServices } from '../test-utils';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1/tct_pb';

const AUCTION_ID_1 = new AuctionId({ inner: new Uint8Array(Array(32).fill(1)) });
const BECH32M_AUCTION_ID_1 = bech32mAuctionId(AUCTION_ID_1);
const MOCK_AUCTION_1 = new DutchAuctionDescription({
  startHeight: 0n,
  endHeight: 120n,
});

const AUCTION_ID_2 = new AuctionId({ inner: new Uint8Array(Array(32).fill(2)) });
const BECH32M_AUCTION_ID_2 = bech32mAuctionId(AUCTION_ID_2);
const MOCK_AUCTION_2 = new DutchAuctionDescription({
  startHeight: 120n,
  endHeight: 240n,
});

const AUCTION_ID_3 = new AuctionId({ inner: new Uint8Array(Array(32).fill(3)) });
const BECH32M_AUCTION_ID_3 = bech32mAuctionId(AUCTION_ID_3);
const MOCK_AUCTION_3 = new DutchAuctionDescription({
  startHeight: 240n,
  endHeight: 360n,
});

const AUCTION_ID_4 = new AuctionId({ inner: new Uint8Array(Array(32).fill(4)) });
const MOCK_AUCTION_4 = new DutchAuctionDescription({
  startHeight: 360n,
  endHeight: 480n,
});

const MOCK_SPENDABLE_NOTE_RECORD = new SpendableNoteRecord({
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
      yield new BalancesResponse({
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
      noteCommitment: new StateCommitment({ inner: new Uint8Array([0, 1, 2, 3]) }),
      seqNum: 0n,
    },
  },
  {
    id: AUCTION_ID_2,
    value: {
      auction: MOCK_AUCTION_2,
      noteCommitment: new StateCommitment({ inner: new Uint8Array([0, 1, 2, 3]) }),
      seqNum: 1n,
    },
  },
  {
    id: AUCTION_ID_3,
    value: {
      auction: MOCK_AUCTION_3,
      noteCommitment: new StateCommitment({ inner: new Uint8Array([0, 1, 2, 3]) }),
      seqNum: 2n,
    },
  },
  {
    id: AUCTION_ID_4,
    value: {
      auction: MOCK_AUCTION_4,
      noteCommitment: new StateCommitment({ inner: new Uint8Array([0, 1, 2, 3]) }),
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
        Promise.resolve(TEST_DATA.find(({ id }) => id.equals(auctionId))?.value),
      ),
      getSpendableNoteByCommitment: vi.fn().mockResolvedValue(MOCK_SPENDABLE_NOTE_RECORD),
    };

    mockQuerier = {
      auction: {
        auctionStateById: vi.fn().mockResolvedValue(new DutchAuction({ state: { seq: 1234n } })),
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
      method: ViewService.methods.auctions,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(servicesCtx, mockServices),
    });
  });

  it('returns auctions', async () => {
    const req = new AuctionsRequest();
    const results = await Array.fromAsync(auctions(req, mockCtx));

    expect(results[0]).toEqual(
      new AuctionsResponse({
        id: AUCTION_ID_1,
        auction: {
          typeUrl: DutchAuction.typeName,
          value: new DutchAuction({ description: MOCK_AUCTION_1 }).toBinary(),
        },
        noteRecord: MOCK_SPENDABLE_NOTE_RECORD,
      }),
    );
  });

  it('excludes auctions not controlled by the current user', async () => {
    const req = new AuctionsRequest();
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
    const req = new AuctionsRequest();
    const results = await Array.fromAsync(auctions(req, mockCtx));

    expect(results.some(result => new AuctionId(result.id).equals(AUCTION_ID_2))).toBe(false);
    expect(results.some(result => new AuctionId(result.id).equals(AUCTION_ID_3))).toBe(false);
  });

  it('includes inactive auctions if `includeInactive` is `true`', async () => {
    const req = new AuctionsRequest({ includeInactive: true });
    const results = await Array.fromAsync(auctions(req, mockCtx));

    expect(results.some(result => new AuctionId(result.id).equals(AUCTION_ID_2))).toBe(true);
    expect(results.some(result => new AuctionId(result.id).equals(AUCTION_ID_3))).toBe(true);
  });

  it('includes the latest state from the fullnode if `queryLatestState` is `true`', async () => {
    const req = new AuctionsRequest({ queryLatestState: true });
    const results = await Array.fromAsync(auctions(req, mockCtx));

    results.forEach(result => {
      if (!result.auction?.value) throw new Error('missing data');
      const dutchAuction = DutchAuction.fromBinary(result.auction.value);

      expect(dutchAuction.state?.seq).toBe(1234n);
    });
  });
});
