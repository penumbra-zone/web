import { beforeEach, describe, expect, it, vi } from 'vitest';
import { epochByHeight } from './epoch-by-height';

import { createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { SctService } from '@penumbra-zone/protobuf';
import {
  Epoch,
  EpochByHeightRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1/sct_pb';
import { createMockContextValues, mockIndexedDb } from '../test-utils';

describe('EpochByHeight request handler', () => {
  let mockCtx: HandlerContext;

  beforeEach(() => {
    vi.resetAllMocks();

    mockCtx = createHandlerContext({
      service: SctService,
      method: SctService.methods.epochByHeight,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createMockContextValues({ db: mockIndexedDb }),
    });
  });

  it('returns an `EpochByHeightResponse` with the result of the database query', async () => {
    const expected = new Epoch({ startHeight: 0n, index: 0n });

    mockIndexedDb.getEpochByHeight.mockResolvedValue(expected);
    const req = new EpochByHeightRequest({ height: 0n });

    const result = await epochByHeight(req, mockCtx);

    expect(result.epoch).toBeInstanceOf(Epoch);
    expect((result.epoch as Epoch).toJson()).toEqual(expected.toJson());
  });
});
