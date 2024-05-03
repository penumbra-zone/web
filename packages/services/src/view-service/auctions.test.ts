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

const AUCTION_ID = new AuctionId({ inner: new Uint8Array(Array(32).fill(0)) });
const BECH32M_AUCTION_ID = bech32mAuctionId(AUCTION_ID);

const MOCK_AUCTION = new DutchAuction({
  description: {
    startHeight: 0n,
    endHeight: 120n,
  },
  state: {
    seq: 0n,
    nextTrigger: 1n,
  },
});

const MOCK_SPENDABLE_NOTE_RECORD = new SpendableNoteRecord({
  heightCreated: 1234n,
});

vi.mock('./balances', () => ({
  *balances() {
    yield new BalancesResponse({
      balanceView: {
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: { hi: 0n, lo: 1n },
            metadata: {
              base: `auctionnft_0_${BECH32M_AUCTION_ID}`,
              display: `auctionnft_0_${BECH32M_AUCTION_ID}`,
              denomUnits: [{ denom: `auctionnft_0_${BECH32M_AUCTION_ID}`, exponent: 0 }],
              penumbraAssetId: { inner: new Uint8Array([0, 1, 2, 3]) },
              symbol: 'auction(abcd1234...)',
            },
          },
        },
      },
    });
  },
}));

const testData = [
  {
    id: AUCTION_ID,
    value: {
      auction: MOCK_AUCTION,
      noteCommitment: new StateCommitment({ inner: new Uint8Array([0, 1, 2, 3]) }),
    },
  },
];

describe('Auctions request handler', () => {
  let mockServices: MockServices;
  let mockCtx: HandlerContext;
  let mockIndexedDb: IndexedDbMock;
  let req: AuctionsRequest;

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

    req = new AuctionsRequest();
  });

  it('returns auctions', async () => {
    const result = await Array.fromAsync(auctions(req, mockCtx));

    expect(result.length).toBe(1);
    expect(result[0]).toEqual(
      new AuctionsResponse({
        id: AUCTION_ID,
        auction: {
          typeUrl: DutchAuction.typeName,
          value: testData[0]!.value.auction.toBinary(),
        },
        noteRecord: MOCK_SPENDABLE_NOTE_RECORD,
      }),
    );
  });
});
