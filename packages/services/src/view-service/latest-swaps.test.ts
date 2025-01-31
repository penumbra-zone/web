import { ViewService } from '@penumbra-zone/protobuf';
import { servicesCtx } from '../ctx/prax.js';
import { fvkCtx } from '../ctx/full-viewing-key.js';

import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';

import { beforeEach, describe, expect, vi, it } from 'vitest';

import {
  LatestSwapsRequest,
  LatestSwapsResponse,
  SwapRecord,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { IndexedDbMock, MockServices, testFullViewingKey } from '../test-utils.js';
import type { ServicesInterface } from '@penumbra-zone/types/services';
import { latestSwaps } from './latest-swaps.js';
import { CommitmentSource } from '@penumbra-zone/protobuf/penumbra/core/component/sct/v1/sct_pb';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getAddressByIndex } from '@penumbra-zone/wasm/keys';
import { pnum } from '@penumbra-zone/types/pnum';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { SHITMOS_METADATA, UM_METADATA, USDC_METADATA } from './util/data.js';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { DirectedTradingPair } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';

describe('LatestSwaps request handler', () => {
  let mockServices: MockServices;
  let mockCtx: HandlerContext;
  let mockIndexedDb: IndexedDbMock;
  let fillDB: (data: SwapRecord[]) => void;

  const request = async (req: LatestSwapsRequest): Promise<LatestSwapsResponse[]> => {
    const responses: LatestSwapsResponse[] = [];

    for await (const res of latestSwaps(req, mockCtx)) {
      responses.push(new LatestSwapsResponse(res));
    }

    return responses;
  };

  beforeEach(() => {
    vi.resetAllMocks();

    const mockIterateSwaps = {
      next: vi.fn(),
      [Symbol.asyncIterator]: () => mockIterateSwaps,
    };

    mockIndexedDb = {
      iterateSwaps: () => mockIterateSwaps,
    };

    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({ indexedDb: mockIndexedDb }),
      ) as MockServices['getWalletServices'],
    };

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.latestSwaps,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues()
        .set(servicesCtx, () => Promise.resolve(mockServices as unknown as ServicesInterface))
        .set(fvkCtx, () => Promise.resolve(testFullViewingKey)),
    });

    fillDB = (data: SwapRecord[]) => {
      for (const record of data) {
        mockIterateSwaps.next.mockResolvedValueOnce({
          value: record,
        });
      }
      mockIterateSwaps.next.mockResolvedValueOnce({
        done: true,
      });
    };
  });

  it('collects swaps with "transaction" source only', async () => {
    fillDB([
      IRRELEVANT_SWAP,
      getSwap({
        height: 100,
        account: 0,
        from: UM_METADATA,
        to: USDC_METADATA,
        input: 100n,
        output: 110n,
      }),
      getSwap({
        height: 9,
        account: 1,
        from: UM_METADATA,
        to: SHITMOS_METADATA,
        input: 100n,
        output: 110n,
      }),
    ]);

    const res = await request(new LatestSwapsRequest({}));

    expect(res.length).toBe(2);
    expect(res[0]?.pair?.start?.equals(UM_METADATA.penumbraAssetId)).toBeTruthy();
    expect(res[0]?.pair?.end?.equals(USDC_METADATA.penumbraAssetId)).toBeTruthy();
    expect(res[0]?.blockHeight).toEqual(100n);
  });

  it('applies `responseLimit` filter correctly', async () => {
    fillDB([
      getSwap({
        height: 100,
        account: 0,
        from: UM_METADATA,
        to: USDC_METADATA,
        input: 100n,
        output: 110n,
      }),
      getSwap({
        height: 9,
        account: 1,
        from: UM_METADATA,
        to: SHITMOS_METADATA,
        input: 100n,
        output: 110n,
      }),
    ]);

    const res = await request(
      new LatestSwapsRequest({
        responseLimit: 1n,
      }),
    );

    expect(res.length).toBe(1);
    expect(res[0]?.blockHeight).toEqual(100n);
  });

  it('applies `afterHeight` filter correctly', async () => {
    fillDB([
      getSwap({
        height: 100,
        account: 0,
        from: UM_METADATA,
        to: USDC_METADATA,
        input: 100n,
        output: 110n,
      }),
      getSwap({
        height: 9,
        account: 1,
        from: UM_METADATA,
        to: SHITMOS_METADATA,
        input: 100n,
        output: 110n,
      }),
    ]);

    const res = await request(
      new LatestSwapsRequest({
        afterHeight: 50n,
      }),
    );

    expect(res.length).toBe(1);
    expect(res[0]?.blockHeight).toEqual(100n);
  });

  it('applies `accountFilter` filter correctly', async () => {
    fillDB([
      getSwap({
        height: 100,
        account: 0,
        from: UM_METADATA,
        to: USDC_METADATA,
        input: 100n,
        output: 110n,
      }),
      getSwap({
        height: 9,
        account: 1,
        from: UM_METADATA,
        to: SHITMOS_METADATA,
        input: 100n,
        output: 110n,
      }),
    ]);

    const res = await request(
      new LatestSwapsRequest({
        accountFilter: new AddressIndex({ account: 0 }),
      }),
    );

    expect(res.length).toBe(1);
  });

  it('applies `pair` filter correctly', async () => {
    fillDB([
      getSwap({
        height: 100,
        account: 0,
        from: UM_METADATA,
        to: USDC_METADATA,
        input: 100n,
        output: 110n,
      }),
      getSwap({
        height: 9,
        account: 1,
        from: UM_METADATA,
        to: SHITMOS_METADATA,
        input: 100n,
        output: 110n,
      }),
    ]);

    const res = await request(
      new LatestSwapsRequest({
        pair: new DirectedTradingPair({
          start: UM_METADATA.penumbraAssetId,
          end: USDC_METADATA.penumbraAssetId,
        }),
      }),
    );

    expect(res.length).toBe(1);
    expect(res[0]?.pair?.start).toEqual(UM_METADATA.penumbraAssetId);
    expect(res[0]?.pair?.end).toEqual(USDC_METADATA.penumbraAssetId);
  });

  it('applies all filters together correctly', async () => {
    fillDB([
      IRRELEVANT_SWAP,
      getSwap({
        height: 0,
        account: 0,
        from: UM_METADATA,
        to: USDC_METADATA,
        input: 100n,
        output: 110n,
      }),
      getSwap({
        height: 99,
        account: 0,
        from: UM_METADATA,
        to: USDC_METADATA,
        input: 100n,
        output: 110n,
      }),
      getSwap({
        height: 100,
        account: 1,
        from: UM_METADATA,
        to: SHITMOS_METADATA,
        input: 100n,
        output: 110n,
      }),
      getSwap({
        height: 101,
        account: 1,
        from: UM_METADATA,
        to: USDC_METADATA,
        input: 100n,
        output: 110n,
      }),
      getSwap({
        height: 102,
        account: 1,
        from: UM_METADATA,
        to: USDC_METADATA,
        input: 100n,
        output: 110n,
      }),
    ]);

    const res = await request(
      new LatestSwapsRequest({
        afterHeight: 50n,
        responseLimit: 1n,
        accountFilter: new AddressIndex({ account: 0 }),
        pair: new DirectedTradingPair({
          start: UM_METADATA.penumbraAssetId,
          end: USDC_METADATA.penumbraAssetId,
        }),
      }),
    );

    expect(res.length).toBe(1);
    expect(res[0]?.blockHeight).toEqual(99n);
  });
});

interface GetSwapOptions {
  height: number;
  from: Metadata;
  to: Metadata;
  account: number;
  input: bigint;
  output: bigint;
}

// Constructs correct SwapRecord with the most essential data needed for `latestSwaps`
const getSwap = ({ account, to, from, height, input, output }: GetSwapOptions) => {
  return new SwapRecord({
    heightClaimed: BigInt(height),
    swapCommitment: { inner: new Uint8Array([1, 2, 3]) },
    nullifier: { inner: new Uint8Array([1, 2, 3]) },
    source: new CommitmentSource({
      source: {
        case: 'transaction',
        value: {
          id: new Uint8Array([1, 2, 3, 4, 5]),
        },
      },
    }),
    swap: {
      claimAddress: getAddressByIndex(testFullViewingKey, account),
    },
    outputData: {
      tradingPair: {
        asset1: from.penumbraAssetId,
        asset2: to.penumbraAssetId,
      },
      delta1: pnum(input, { exponent: getDisplayDenomExponent(from) }).toAmount(),
      delta2: pnum(output, { exponent: getDisplayDenomExponent(to) }).toAmount(),
    },
  });
};

// Irrelevant – wrong source (should be 'transaction')
const IRRELEVANT_SWAP = new SwapRecord({
  swapCommitment: { inner: new Uint8Array([1, 2, 3]) },
  nullifier: { inner: new Uint8Array([1, 2, 3]) },
  source: new CommitmentSource({
    source: {
      case: 'ics20Transfer',
      value: { channelId: '', sender: '' },
    },
  }),
});
