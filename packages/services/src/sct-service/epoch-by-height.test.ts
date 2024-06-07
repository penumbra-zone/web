import {
  Epoch,
  EpochByHeightRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1/sct_pb';
import { HandlerContext, createContextValues, createHandlerContext } from '@connectrpc/connect';
import { SctService } from '@penumbra-zone/protobuf';
import { IndexedDbInterface } from '@penumbra-zone/types/indexed-db';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { idbCtx } from '../ctx/prax';
import { IndexedDbMock } from '../test-utils';
import { epochByHeight } from './epoch-by-height';

describe('EpochByHeight request handler', () => {
  let mockIndexedDb: IndexedDbMock;
  let mockCtx: HandlerContext;

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb = {
      getEpochByHeight: vi.fn(),
    };

    mockCtx = createHandlerContext({
      service: SctService,
      method: SctService.methods.epochByHeight,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(idbCtx, () =>
        Promise.resolve(mockIndexedDb as unknown as IndexedDbInterface),
      ),
    });
  });

  it('returns an `EpochByHeightResponse` with the result of the database query', async () => {
    const expected = new Epoch({ startHeight: 0n, index: 0n });

    mockIndexedDb.getEpochByHeight?.mockResolvedValue(expected);
    const req = new EpochByHeightRequest({ height: 0n });

    const result = await epochByHeight(req, mockCtx);

    expect(result.epoch).toBeInstanceOf(Epoch);
    expect((result.epoch as Epoch).toJson()).toEqual(expected.toJson());
  });
});
