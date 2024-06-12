import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  StatusRequest,
  StatusResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import {
  createContextValues,
  createHandlerContext,
  createRouterTransport,
  HandlerContext,
} from '@connectrpc/connect';
import { TendermintProxyService, ViewService } from '@penumbra-zone/protobuf';
import { status } from './status';
import { dbCtx } from '../ctx/database';
import { DatabaseCtx } from '../ctx/database';
import { mockIndexedDb, mockTendermintService } from '../test-utils';
import { fullnodeCtx } from '../ctx/fullnode';

describe('Status request handler', () => {
  let mockCtx: HandlerContext;

  beforeEach(() => {
    vi.resetAllMocks();

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.status,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues()
        .set(dbCtx, () => Promise.resolve(mockIndexedDb as unknown as DatabaseCtx))
        .set(fullnodeCtx, () =>
          Promise.resolve(
            createRouterTransport(({ service }) =>
              service(TendermintProxyService, mockTendermintService),
            ),
          ),
        ),
    });
  });

  test('should get status when view service is synchronized with last known block in tendermint', async () => {
    mockIndexedDb.getFullSyncHeight.mockResolvedValue(222n);
    mockTendermintService.getStatus.mockResolvedValue({ syncInfo: { latestBlockHeight: 222n } });
    const statusResponse = new StatusResponse(await status(new StatusRequest(), mockCtx));
    expect(statusResponse.catchingUp).toBe(false);
    expect(statusResponse.fullSyncHeight === 222n).toBeTruthy();
  });

  test('should receive status when view service synchronizes and lags behind last known block in tendermint', async () => {
    mockIndexedDb.getFullSyncHeight.mockResolvedValue(111n);
    mockTendermintService.getStatus.mockResolvedValue({ syncInfo: { latestBlockHeight: 222n } });
    const statusResponse = new StatusResponse(await status(new StatusRequest(), mockCtx));
    expect(statusResponse.catchingUp).toBe(true);
    expect(statusResponse.partialSyncHeight === 111n).toBeTruthy();
  });
});
