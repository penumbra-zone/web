import { ViewService } from '@penumbra-zone/protobuf';

import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  OwnedPositionIdsRequest,
  OwnedPositionIdsResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

import { PositionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { ownedPositionIds } from './owned-position-ids';
import { dbCtx } from '../ctx/database';
import { DatabaseCtx } from '../ctx/database';
import { mockIndexedDb } from '../test-utils';

describe('OwnedPositionIds request handler', () => {
  let mockCtx: HandlerContext;
  let req: OwnedPositionIdsRequest;

  beforeEach(() => {
    vi.resetAllMocks();

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.ownedPositionIds,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(dbCtx, () =>
        Promise.resolve(mockIndexedDb as unknown as DatabaseCtx),
      ),
    });

    mockIndexedDb.getOwnedPositionIds.mockImplementation(async function* () {
      for await (const record of testData) {
        yield record;
      }
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
