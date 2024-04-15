import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { servicesCtx } from '../ctx/prax';

import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  OwnedPositionIdsRequest,
  OwnedPositionIdsResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { IndexedDbMock, MockServices } from '../test-utils';
import { Services } from '@penumbra-zone/services-context/src/index';
import { PositionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
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
      getOwnedPositionIds: () => mockIteratePositions,
    };

    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({ indexedDb: mockIndexedDb }),
      ) as MockServices['getWalletServices'],
    };

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.ownedPositionIds,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
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

  test('should get all owned position ids', async () => {
    const responses: OwnedPositionIdsResponse[] = [];
    for await (const res of ownedPositionIds(req, mockCtx)) {
      responses.push(new OwnedPositionIdsResponse(res));
    }
    expect(responses.length).toBe(3);
  });
});

const testData: PositionId[] = [
  PositionId.fromJson({
    inner: 'qE/PCp65S+GHi2HFO74G8Gx5ansmxeMwEdNUgn3GXYE=',
  }),
  PositionId.fromJson({
    inner: 'jPb6+hLkYgwIs4sVxhyYUmpbvIyPOXATqL/hiKGwhbg=',
  }),
  PositionId.fromJson({
    inner: '8hpmQDWRJFAqYI1NaKltjbFqCRiI4eEQT5DzzNUkDXQ=',
  }),
];
