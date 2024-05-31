import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  StatusRequest,
  StatusResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import { servicesCtx } from '../ctx/prax';
import { IndexedDbMock, MockServices, TendermintMock } from '../test-utils';
import { status } from './status';
import type { ServicesInterface } from '@penumbra-zone/types/services';

describe('Status request handler', () => {
  let mockServices: MockServices;
  let mockIndexedDb: IndexedDbMock;
  let mockCtx: HandlerContext;
  let mockTendermint: TendermintMock;

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb = {
      getFullSyncHeight: vi.fn(),
    };

    mockTendermint = {
      latestBlockHeight: vi.fn(),
    };

    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({ indexedDb: mockIndexedDb }),
      ) as MockServices['getWalletServices'],
      querier: {
        tendermint: mockTendermint,
      },
    };

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.status,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(servicesCtx, () =>
        Promise.resolve(mockServices as unknown as ServicesInterface),
      ),
    });
  });

  test('should get status when view service is synchronized with last known block in tendermint', async () => {
    mockIndexedDb.getFullSyncHeight?.mockResolvedValue(222n);
    mockTendermint.latestBlockHeight?.mockResolvedValue(222n);
    const statusResponse = new StatusResponse(await status(new StatusRequest(), mockCtx));
    expect(statusResponse.catchingUp).toBe(false);
    expect(statusResponse.fullSyncHeight === 222n).toBeTruthy();
  });

  test('should receive status when view service synchronizes and lags behind last known block in tendermint', async () => {
    mockIndexedDb.getFullSyncHeight?.mockResolvedValue(111n);
    mockTendermint.latestBlockHeight?.mockResolvedValue(222n);
    const statusResponse = new StatusResponse(await status(new StatusRequest(), mockCtx));
    expect(statusResponse.catchingUp).toBe(true);
    expect(statusResponse.partialSyncHeight === 111n).toBeTruthy();
  });
});
