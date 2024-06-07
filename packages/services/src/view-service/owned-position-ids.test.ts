import { PositionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import {
  OwnedPositionIdsRequest,
  OwnedPositionIdsResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { idbCtx } from '../ctx/prax';
import { IndexedDbMock } from '../test-utils';
import { ownedPositionIds } from './owned-position-ids';

describe('OwnedPositionIds request handler', () => {
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

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.ownedPositionIds,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(idbCtx, () =>
        Promise.resolve(mockIndexedDb as unknown),
      ),
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
