import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import {
  StatusStreamRequest,
  StatusStreamResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { servicesCtx } from '../ctx/prax';
import { IndexedDbMock, MockServices, TendermintMock } from '../test-utils';
import { statusStream } from './status-stream';
import type { ServicesInterface } from '@penumbra-zone/types/src/services';

describe('Status stream request handler', () => {
  let mockServices: MockServices;
  let mockIndexedDb: IndexedDbMock;
  let mockCtx: HandlerContext;
  let mockTendermint: TendermintMock;
  let lastBlockSubNext: Mock;
  let request: StatusStreamRequest;

  beforeEach(() => {
    vi.resetAllMocks();

    lastBlockSubNext = vi.fn();
    const mockLastBlockSubscription = {
      next: lastBlockSubNext,
      [Symbol.asyncIterator]: () => mockLastBlockSubscription,
    };

    mockIndexedDb = {
      subscribe: () => mockLastBlockSubscription,
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
      method: ViewService.methods.statusStream,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(
        servicesCtx,
        mockServices as unknown as ServicesInterface,
      ),
    });

    request = new StatusStreamRequest();

    for (let i = 200; i < 222; i++) {
      lastBlockSubNext.mockResolvedValueOnce({
        value: {
          value: BigInt(i),
        },
      });
    }
    // synchronization never ends, but the test can't last indefinitely, so we end the stream
    lastBlockSubNext.mockResolvedValueOnce({
      done: true,
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
