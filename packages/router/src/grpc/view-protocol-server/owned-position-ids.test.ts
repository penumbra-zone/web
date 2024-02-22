import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { servicesCtx } from '../../ctx';

import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  OwnedPositionIdsRequest,
  OwnedPositionIdsResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { IndexedDbMock, MockServices } from './test-utils';
import { Services } from '@penumbra-zone/services';
import { PositionRecord } from '@penumbra-zone/types';
import {
  PositionState,
  PositionState_PositionStateEnum,
  TradingPair,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { ownedPositionIds } from './owned-position-ids';

describe('OwnedPositionIds request handler', () => {
  let mockServices: MockServices;
  let mockCtx: HandlerContext;
  let mockIndexedDb: IndexedDbMock;
  let req: OwnedPositionIdsRequest;

  beforeEach(() => {
    vi.resetAllMocks();

    const mockIteratePositions = {
      next: vi.fn(),
      [Symbol.asyncIterator]: () => mockIteratePositions,
    };

    mockIndexedDb = {
      iteratePositions: () => mockIteratePositions,
    };

    mockServices = {
      getWalletServices: vi.fn(() => Promise.resolve({ indexedDb: mockIndexedDb })),
    };

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.ownedPositionIds,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      contextValues: createContextValues().set(servicesCtx, mockServices as unknown as Services),
    });

    for (const record of testData) {
      mockIteratePositions.next.mockResolvedValueOnce({
        value: record,
      });
    }
    mockIteratePositions.next.mockResolvedValueOnce({
      done: true,
    });
    req = new OwnedPositionIdsRequest();
  });

  test('should get all owned position ids if positionState and tradingPair is missing', async () => {
    const responses: OwnedPositionIdsResponse[] = [];
    for await (const res of ownedPositionIds(req, mockCtx)) {
      responses.push(new OwnedPositionIdsResponse(res));
    }
    expect(responses.length).toBe(3);
  });

  test('should get owned position ids with given positionState', async () => {
    req.positionState = new PositionState({ state: PositionState_PositionStateEnum.CLOSED });
    const responses: OwnedPositionIdsResponse[] = [];
    for await (const res of ownedPositionIds(req, mockCtx)) {
      responses.push(new OwnedPositionIdsResponse(res));
    }
    expect(responses.length).toBe(1);
  });

  test('should get owned position ids with given tradingPair', async () => {
    req.tradingPair = tradingPairGmGn;
    const responses: OwnedPositionIdsResponse[] = [];
    for await (const res of ownedPositionIds(req, mockCtx)) {
      responses.push(new OwnedPositionIdsResponse(res));
    }
    expect(responses.length).toBe(1);
  });

  test('should get owned position ids with given tradingPair and given positionState', async () => {
    req.tradingPair = tradingPairGmGn;
    req.positionState = new PositionState({ state: PositionState_PositionStateEnum.OPENED });
    const responses: OwnedPositionIdsResponse[] = [];
    for await (const res of ownedPositionIds(req, mockCtx)) {
      responses.push(new OwnedPositionIdsResponse(res));
    }
    expect(responses.length).toBe(0);
  });
});

const testData: PositionRecord[] = [
  // Gm/Penumbra Buy
  {
    position: {
      phi: {
        pair: {
          asset1: { inner: 'HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc=' },
          asset2: { inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=' },
        },
      },
      state: { state: 'POSITION_STATE_ENUM_OPENED' },
    },
    id: {
      inner: 'qE/PCp65S+GHi2HFO74G8Gx5ansmxeMwEdNUgn3GXYE=',
    },
  },
  // Gn/Penumbra Sell
  {
    position: {
      phi: {
        pair: {
          asset1: { inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=' },
          asset2: { inner: 'nwPDkQq3OvLnBwGTD+nmv1Ifb2GEmFCgNHrU++9BsRE=' },
        },
      },
      state: { state: 'POSITION_STATE_ENUM_OPENED' },
    },
    id: {
      inner: 'jPb6+hLkYgwIs4sVxhyYUmpbvIyPOXATqL/hiKGwhbg=',
    },
  },
  // Gm/Gn Sell
  {
    position: {
      phi: {
        pair: {
          asset1: { inner: 'HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc=' },
          asset2: { inner: 'nwPDkQq3OvLnBwGTD+nmv1Ifb2GEmFCgNHrU++9BsRE=' },
        },
      },
      state: { state: 'POSITION_STATE_ENUM_CLOSED' },
    },
    id: {
      inner: '8hpmQDWRJFAqYI1NaKltjbFqCRiI4eEQT5DzzNUkDXQ=',
    },
  },
];

export const tradingPairGmGn = TradingPair.fromJson({
  asset1: { inner: 'HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc=' },
  asset2: { inner: 'nwPDkQq3OvLnBwGTD+nmv1Ifb2GEmFCgNHrU++9BsRE=' },
});
