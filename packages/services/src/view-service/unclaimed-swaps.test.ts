import { ViewService } from '@penumbra-zone/protobuf';
import { servicesCtx } from '../ctx/prax.js';

import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  SwapRecord,
  UnclaimedSwapsRequest,
  UnclaimedSwapsResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { mockIndexedDb, MockServices } from '../test-utils.js';
import type { ServicesInterface } from '@penumbra-zone/types/services';
import { unclaimedSwaps } from './unclaimed-swaps.js';

describe('UnclaimedSwaps request handler', () => {
  let mockServices: MockServices;
  let mockCtx: HandlerContext;
  let req: UnclaimedSwapsRequest;

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb.iterateSwaps.mockImplementationOnce(async function* () {
      yield* await Promise.resolve(testData);
    });

    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({ indexedDb: mockIndexedDb }),
      ) as MockServices['getWalletServices'],
    };

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.unclaimedSwaps,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(servicesCtx, () =>
        Promise.resolve(mockServices as unknown as ServicesInterface),
      ),
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
