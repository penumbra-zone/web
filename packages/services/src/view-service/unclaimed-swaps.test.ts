import { ViewService } from '@penumbra-zone/protobuf';

import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  SwapRecord,
  UnclaimedSwapsRequest,
  UnclaimedSwapsResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { DbMock } from '../test-utils';
import { unclaimedSwaps } from './unclaimed-swaps';
import { dbCtx } from '../ctx/database';
import { DatabaseCtx } from '../ctx/database';

describe('UnclaimedSwaps request handler', () => {
  let mockCtx: HandlerContext;
  let mockIndexedDb: DbMock;
  let req: UnclaimedSwapsRequest;

  beforeEach(() => {
    vi.resetAllMocks();

    const mockIterateSwaps = {
      next: vi.fn(),
      [Symbol.asyncIterator]: () => mockIterateSwaps,
    };

    mockIndexedDb = {
      iterateSwaps: () => mockIterateSwaps,
    };

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.unclaimedSwaps,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(dbCtx, () =>
        Promise.resolve(mockIndexedDb as unknown as DatabaseCtx),
      ),
    });

    for (const record of testData) {
      mockIterateSwaps.next.mockResolvedValueOnce({
        value: record,
      });
    }
    mockIterateSwaps.next.mockResolvedValueOnce({
      done: true,
    });
    req = new UnclaimedSwapsRequest();
  });

  test('should get all swaps with undefined heightClaimed', async () => {
    const responses: UnclaimedSwapsResponse[] = [];
    for await (const res of unclaimedSwaps(req, mockCtx)) {
      responses.push(new UnclaimedSwapsResponse(res));
    }
    expect(responses.length).toBe(2);
  });
});

const testData: SwapRecord[] = [
  SwapRecord.fromJson({
    swapCommitment: { inner: '16VBVkrk+s18q+Sjhl8uEGfS3i0dwF1FrkNm8Db6VAA=' },
    heightClaimed: 122,
    nullifier: { inner: '1E7LbhBDgDXHiRvreFyCllcKOOQeuIVsbn2aw8uKhww=' },
  }),
  SwapRecord.fromJson({
    swapCommitment: { inner: '26VBVkrk+s18q+Sjhl8uEGfS3i0dwF1FrkNm8Db6VAA=' },
    nullifier: { inner: '2E7LbhBDgDXHiRvreFyCllcKOOQeuIVsbn2aw8uKhww=' },
  }),
  SwapRecord.fromJson({
    swapCommitment: { inner: '36VBVkrk+s18q+Sjhl8uEGfS3i0dwF1FrkNm8Db6VAA=' },
    nullifier: { inner: '3E7LbhBDgDXHiRvreFyCllcKOOQeuIVsbn2aw8uKhww=' },
  }),
];
