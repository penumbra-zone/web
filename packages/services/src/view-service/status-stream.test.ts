import {
  StatusStreamRequest,
  StatusStreamResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import {
  createContextValues,
  createHandlerContext,
  createRouterTransport,
  HandlerContext,
} from '@connectrpc/connect';
import { TendermintProxyService, ViewService } from '@penumbra-zone/protobuf';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { DatabaseCtx, dbCtx } from '../ctx/database';
import { fullnodeCtx } from '../ctx/fullnode';

import { statusStream } from './status-stream';
import { mockIndexedDb, mockTendermintService } from '../test-utils';

describe('Status stream request handler', () => {
  let mockCtx: HandlerContext;

  let request: StatusStreamRequest;

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb.subscribeFullSyncHeight.mockImplementation(async function* () {
      for (let i = 200n; i < 222n; i++) {
        yield await Promise.resolve(i);
      }
    });

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.statusStream,
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

    request = new StatusStreamRequest();
  });

  test('should receive a status stream when view service synchronizes and lags behind last known block in tendermint', async () => {
    mockTendermintService.getStatus.mockResolvedValue({ syncInfo: { latestBlockHeight: 222n } });
    for await (const res of statusStream(request, mockCtx)) {
      const response = new StatusStreamResponse(res);
      expect(response.latestKnownBlockHeight === 222n).toBeTruthy();
      expect(response.partialSyncHeight === response.fullSyncHeight).toBeTruthy();
    }
  });

  test('should receive a status stream when view service is synchronized block by block', async () => {
    mockTendermintService.getStatus.mockResolvedValue({ syncInfo: { latestBlockHeight: 200n } });
    for await (const res of statusStream(request, mockCtx)) {
      const response = new StatusStreamResponse(res);
      expect(response.partialSyncHeight === response.fullSyncHeight).toBeTruthy();
      expect(response.fullSyncHeight === response.latestKnownBlockHeight).toBeTruthy();
    }
  });
});
