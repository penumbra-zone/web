import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  StatusRequest,
  StatusResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { ServicesInterface } from '@penumbra-zone/types';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { servicesCtx } from '../../ctx';
import { IndexedDbMock, MockServices, TendermintMock } from './test-utils';
import { status } from './status';

describe('Status request handler', () => {
  let mockServices: MockServices;
  let mockIndexedDb: IndexedDbMock;
  let mockCtx: HandlerContext;
  let mockTendermint: TendermintMock;

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb = {
      getfullSyncHeight: vi.fn(),
    };

    mockTendermint = {
      latestBlockHeight: vi.fn(),
    };

    mockServices = {
      getWalletServices: vi.fn(() => Promise.resolve({ indexedDb: mockIndexedDb })),
      querier: {
        tendermint: mockTendermint,
      },
    };

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.status,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      contextValues: createContextValues().set(
        servicesCtx,
        mockServices as unknown as ServicesInterface,
      ),
    });
  });

  test('should get status when view service is synchronized with last known block in tendermint', async () => {
    mockIndexedDb.getfullSyncHeight?.mockResolvedValue(222n);
    mockTendermint.latestBlockHeight?.mockResolvedValue(222n);
    const statusResponse = new StatusResponse(await status(new StatusRequest(), mockCtx));
    expect(statusResponse.catchingUp).toBeTruthy();
    expect(statusResponse.fullSyncHeight === 222n).toBeTruthy();
  });

  test('should receive status when view service synchronizes and lags behind last known block in tendermint', async () => {
    mockIndexedDb.getfullSyncHeight?.mockResolvedValue(111n);
    mockTendermint.latestBlockHeight?.mockResolvedValue(222n);
    const statusResponse = new StatusResponse(await status(new StatusRequest(), mockCtx));
    expect(statusResponse.catchingUp).toBeFalsy();
    expect(statusResponse.partialSyncHeight === 111n).toBeTruthy();
  });

  test('should get an error if there is no fullSyncHeight record in indexed-db', async () => {
    mockIndexedDb.getfullSyncHeight?.mockResolvedValue(undefined);
    mockTendermint.latestBlockHeight?.mockResolvedValue(222n);
    await expect(status(new StatusRequest(), mockCtx)).rejects.toThrow();
  });
});
