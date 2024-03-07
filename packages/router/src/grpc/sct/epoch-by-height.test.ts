import { beforeEach, describe, expect, it, vi } from 'vitest';
import { epochByHeight } from './epoch-by-height';
import { IndexedDbMock, MockServices } from '../test-utils';
import { HandlerContext, createContextValues, createHandlerContext } from '@connectrpc/connect';
import { QueryService as SctService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/sct/v1/sct_connect';
import { ServicesInterface } from '@penumbra-zone/types';
import { servicesCtx } from '../../ctx';
import {
  Epoch,
  EpochByHeightRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1/sct_pb';

describe('EpochByHeight request handler', () => {
  let mockServices: MockServices;
  let mockIndexedDb: IndexedDbMock;
  let mockCtx: HandlerContext;

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb = {
      getEpochByHeight: vi.fn(),
    };
    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({ indexedDb: mockIndexedDb }),
      ) as MockServices['getWalletServices'],
    };
    mockCtx = createHandlerContext({
      service: SctService,
      method: SctService.methods.epochByHeight,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(
        servicesCtx,
        mockServices as unknown as ServicesInterface,
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
