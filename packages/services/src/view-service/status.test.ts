import {
  StatusRequest,
  StatusResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { HandlerContext, createContextValues, createHandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { idbCtx, querierCtx } from '../ctx/prax';
import { IndexedDbMock, TendermintMock } from '../test-utils';
import { status } from './status';

describe('Status request handler', () => {
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

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.status,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues()
        .set(idbCtx, () => Promise.resolve(mockIndexedDb as unknown))
        .set(querierCtx, () => Promise.resolve({ tendermint: mockTendermint } as unknown)),
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
