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
  const mockHeights: bigint[] = Array.from({ length: 100 }, () => 0n);

  beforeEach(() => {
    vi.resetAllMocks();

    // create a sequence starting at a random height
    mockHeights.fill(BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)));
    mockHeights.forEach((f, i) => {
      mockHeights[i] = f + BigInt(i);
    });

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
          yield* createUpdates(table, mockHeights);
          break;
        default:
          expect.unreachable(`Test should not subscribe to ${table}`);
      }
    });
  });

  test('should stream status updates while catching up and and passing initial latest', async () => {
    const highest = mockHeights.at(-1)!;
    const later = mockHeights.at(-((mockHeights.length * Math.random()) / 2))!;
    mockTendermint.latestBlockHeight?.mockResolvedValue(later);

    let reachedLater = false;

    for await (const res of statusStream(request, mockCtx)) {
      const response = new StatusStreamResponse(res);

      expect(response.fullSyncHeight).toBe(response.partialSyncHeight);

      if (!reachedLater) {
        expect(response.fullSyncHeight).toBeLessThan(response.latestKnownBlockHeight);
        reachedLater = response.fullSyncHeight === later - 1n;
      } else {
        expect(response.fullSyncHeight).toBe(response.latestKnownBlockHeight);
      }

      if (response.partialSyncHeight !== highest) {
        expect(response.partialSyncHeight).toBeLessThan(highest);
        expect(response.fullSyncHeight).toBeLessThan(highest);
        expect(response.latestKnownBlockHeight).toBeLessThan(highest);
        continue;
      } else {
        // reached highest
        expect(reachedLater).toBeTruthy();
        expect(response.partialSyncHeight).toBe(response.latestKnownBlockHeight);
        expect(response.fullSyncHeight).toBe(response.latestKnownBlockHeight);
        expect(response.latestKnownBlockHeight).toBe(highest);
        break; // no more test data, must exit or stall
      }
    }
  });
});
