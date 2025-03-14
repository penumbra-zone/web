import { ViewService } from '@penumbra-zone/protobuf';
import { create, fromJson } from '@bufbuild/protobuf';
import { servicesCtx } from '../ctx/prax.js';

import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  OwnedPositionIdsRequestSchema,
  OwnedPositionIdsResponseSchema,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import type {
  OwnedPositionIdsRequest,
  OwnedPositionIdsResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { IndexedDbMock, MockServices } from '../test-utils.js';
import type { ServicesInterface } from '@penumbra-zone/types/services';
import { PositionIdSchema } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import type { PositionId } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { ownedPositionIds } from './owned-position-ids.js';

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
      method: ViewService.method.ownedPositionIds,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(servicesCtx, () =>
        Promise.resolve(mockServices as unknown as ServicesInterface),
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
    req = create(OwnedPositionIdsRequestSchema);
  });

  test('should get all owned position ids', async () => {
    const responses: OwnedPositionIdsResponse[] = [];
    for await (const res of ownedPositionIds(req, mockCtx)) {
      responses.push(create(OwnedPositionIdsResponseSchema, res));
    }
    expect(responses.length).toBe(3);
  });
});

const testData: PositionId[] = [
  fromJson(PositionIdSchema, {
    inner: 'qE/PCp65S+GHi2HFO74G8Gx5ansmxeMwEdNUgn3GXYE=',
  }),
  fromJson(PositionIdSchema, {
    inner: 'jPb6+hLkYgwIs4sVxhyYUmpbvIyPOXATqL/hiKGwhbg=',
  }),
  fromJson(PositionIdSchema, {
    inner: '8hpmQDWRJFAqYI1NaKltjbFqCRiI4eEQT5DzzNUkDXQ=',
  }),
];
