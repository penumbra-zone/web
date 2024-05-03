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
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1alpha1/auction_pb';
import { bech32mAuctionId } from '@penumbra-zone/bech32m/pauctid';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { ServicesInterface } from '@penumbra-zone/types/services';
import { HandlerContext, createContextValues, createHandlerContext } from '@connectrpc/connect';
import { servicesCtx } from '../ctx/prax';
import { IndexedDbMock, MockServices } from '../test-utils';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1/tct_pb';

const AUCTION_ID_1 = new AuctionId({ inner: new Uint8Array(Array(32).fill(0)) });
const BECH32M_AUCTION_ID_1 = bech32mAuctionId(AUCTION_ID_1);
const MOCK_AUCTION_1 = new DutchAuction({
  description: {
    startHeight: 0n,
    endHeight: 120n,
  },
  state: {
    seq: 0n,
    nextTrigger: 1n,
  },
});

const AUCTION_ID_2 = new AuctionId({ inner: new Uint8Array(Array(32).fill(0)) });
const BECH32M_AUCTION_ID_2 = bech32mAuctionId(AUCTION_ID_2);
const MOCK_AUCTION_2 = new DutchAuction({
  description: {
    startHeight: 120n,
    endHeight: 240n,
  },
  state: {
    seq: 1n,
    nextTrigger: 121n,
  },
});

const AUCTION_ID_3 = new AuctionId({ inner: new Uint8Array(Array(32).fill(0)) });
const BECH32M_AUCTION_ID_3 = bech32mAuctionId(AUCTION_ID_3);
const MOCK_AUCTION_3 = new DutchAuction({
  description: {
    startHeight: 240n,
    endHeight: 360n,
  },
  state: {
    seq: 2n,
    nextTrigger: 241n,
  },
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

const testData = [
  {
    id: AUCTION_ID_1,
    value: {
      auction: MOCK_AUCTION_1,
      noteCommitment: new StateCommitment({ inner: new Uint8Array([0, 1, 2, 3]) }),
    },
  },
  {
    id: AUCTION_ID_2,
    value: {
      auction: MOCK_AUCTION_2,
      noteCommitment: new StateCommitment({ inner: new Uint8Array([0, 1, 2, 3]) }),
    },
  },
  {
    id: AUCTION_ID_3,
    value: {
      auction: MOCK_AUCTION_3,
      noteCommitment: new StateCommitment({ inner: new Uint8Array([0, 1, 2, 3]) }),
    },
  },
];

describe('Auctions request handler', () => {
  let mockServices: MockServices;
  let mockCtx: HandlerContext;
  let mockIndexedDb: IndexedDbMock;

  beforeEach(() => {
    vi.resetAllMocks();

    const mockIterateAuctions = {
      next: vi.fn(),
      [Symbol.asyncIterator]: () => mockIterateAuctions,
    };

    mockIndexedDb = {
      iterateAuctions: () => mockIterateAuctions,
      getSpendableNoteByCommitment: vi.fn().mockResolvedValue(MOCK_SPENDABLE_NOTE_RECORD),
    };

    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({
          indexedDb: mockIndexedDb,
        }),
      ) as MockServices['getWalletServices'],
    };

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.auctions,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(
        servicesCtx,
        mockServices as unknown as ServicesInterface,
      ),
    });

    for (const record of testData) {
      mockIterateAuctions.next.mockResolvedValueOnce({
        value: record,
      });
    }
    mockIterateAuctions.next.mockResolvedValueOnce({
      done: true,
    });
  });

  it('returns auctions', async () => {
    const req = new AuctionsRequest();
    const result = await Array.fromAsync(auctions(req, mockCtx));

    expect(result[0]).toEqual(
      new AuctionsResponse({
        id: AUCTION_ID_1,
        auction: {
          typeUrl: DutchAuction.typeName,
          value: testData[0]!.value.auction.toBinary(),
        },
        noteRecord: MOCK_SPENDABLE_NOTE_RECORD,
      }),
    );
  });

  it('returns only active auctions by default', async () => {
    const req = new AuctionsRequest();
    const result = await Array.fromAsync(auctions(req, mockCtx));

    expect(result.length).toBe(1);
  });

  it('includes inactive auctions when requested', async () => {
    const req = new AuctionsRequest({ includeInactive: true });
    const result = await Array.fromAsync(auctions(req, mockCtx));

    expect(result.length).toBe(3);
  });
});
