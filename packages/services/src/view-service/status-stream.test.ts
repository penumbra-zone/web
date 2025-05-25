import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  StatusStreamRequest,
  StatusStreamResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import { servicesCtx } from '../ctx/prax.js';
import { createUpdates, mockIndexedDb, MockServices, TendermintMock } from '../test-utils.js';
import { statusStream } from './status-stream.js';
import type { ServicesInterface } from '@penumbra-zone/types/services';

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
      switch (table) {
        case 'FULL_SYNC_HEIGHT':
          yield* createUpdates(
            table,
            new Array(23).fill(200n).map((_, i) => 200n + BigInt(i)),
          );
          break;
        default:
          expect.unreachable(`Test should not subscribe to ${table}`);
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
