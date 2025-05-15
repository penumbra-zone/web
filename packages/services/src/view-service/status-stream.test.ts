import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import {
  StatusStreamRequest,
  StatusStreamResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import type { ServicesInterface } from '@penumbra-zone/types/services';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { servicesCtx } from '../ctx/prax.js';
import { mockIndexedDb, MockServices, TendermintMock } from '../test-utils.js';
import { statusStream } from './status-stream.js';

describe('Status stream request handler', () => {
  let mockServices: MockServices;
  let mockCtx: HandlerContext;
  let mockTendermint: TendermintMock;
  let request: StatusStreamRequest;

  beforeEach(() => {
    vi.resetAllMocks();

    mockTendermint = {
      latestBlockHeight: vi.fn(),
    };

    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({
          indexedDb: mockIndexedDb,
          querier: {
            tendermint: mockTendermint,
          },
        }),
      ) as MockServices['getWalletServices'],
    };

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.statusStream,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(servicesCtx, () =>
        Promise.resolve(mockServices as unknown as ServicesInterface),
      ),
    });

    request = new StatusStreamRequest();

    mockIndexedDb.subscribe.mockImplementationOnce(async function* (table) {
      if (table === 'FULL_SYNC_HEIGHT') {
        for (let i = 200; i < 222; i++) {
          yield await Promise.resolve({ table, value: BigInt(i) });
        }
      } else {
        expect.unreachable('Test should only subscribe to FULL_SYNC_HEIGHT');
      }
    });
  });

  test('should receive a status stream when view service synchronizes and lags behind last known block in tendermint', async () => {
    mockTendermint.latestBlockHeight?.mockResolvedValue(222n);
    for await (const res of statusStream(request, mockCtx)) {
      const response = new StatusStreamResponse(res);
      expect(response.latestKnownBlockHeight === 222n).toBeTruthy();
      expect(response.partialSyncHeight === response.fullSyncHeight).toBeTruthy();
    }
  });

  test('should receive a status stream when view service is synchronized block by block', async () => {
    mockTendermint.latestBlockHeight?.mockResolvedValue(200n);
    for await (const res of statusStream(request, mockCtx)) {
      const response = new StatusStreamResponse(res);
      expect(response.partialSyncHeight === response.fullSyncHeight).toBeTruthy();
      expect(response.fullSyncHeight === response.latestKnownBlockHeight).toBeTruthy();
    }
  });
});
