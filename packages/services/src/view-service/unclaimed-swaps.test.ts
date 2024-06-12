import {
  SwapRecord,
  UnclaimedSwapsRequest,
  UnclaimedSwapsResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { DatabaseCtx, dbCtx } from '../ctx/database';
import { mockIndexedDb } from '../test-utils';
import { unclaimedSwaps } from './unclaimed-swaps';

describe('UnclaimedSwaps request handler', () => {
  let mockCtx: HandlerContext;
  let req: UnclaimedSwapsRequest;

  beforeEach(() => {
    vi.resetAllMocks();

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

    mockIndexedDb.iterateSwaps.mockImplementation(async function* () {
      yield* await Promise.resolve(testData);
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
