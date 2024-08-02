import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { MockServices } from '../test-utils.js';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { SctService } from '@penumbra-zone/protobuf';
import { servicesCtx } from '../ctx/prax.js';
import type { ServicesInterface } from '@penumbra-zone/types/services';
import {
  TimestampByHeightRequest,
  TimestampByHeightResponse,
} from '@penumbra-zone/protobuf/penumbra/core/component/sct/v1/sct_pb';
import { Timestamp } from '@bufbuild/protobuf';
import { timestampByHeight } from './timestamp-by-height.js';

describe('TimestampByHeight request handler', () => {
  let mockServices: MockServices;
  let mockSctQuerierTimestampByHeight: Mock;
  let mockCtx: HandlerContext;
  const mockTimestampByHeighResponse = new TimestampByHeightResponse({
    timestamp: Timestamp.now(),
  });

  beforeEach(() => {
    vi.resetAllMocks();

    mockSctQuerierTimestampByHeight = vi.fn().mockResolvedValue(mockTimestampByHeighResponse);

    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({
          querier: {
            sct: { timestampByHeight: mockSctQuerierTimestampByHeight },
          },
        }),
      ) as MockServices['getWalletServices'],
    } satisfies MockServices;

    mockCtx = createHandlerContext({
      service: SctService,
      method: SctService.methods.timestampByHeight,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(servicesCtx, () =>
        Promise.resolve(mockServices as unknown as ServicesInterface),
      ),
    });
  });

  it("returns the response from the sct querier's `timestampByHeight` method", async () => {
    const req = new TimestampByHeightRequest({
      height: 729n,
    });
    const result = await timestampByHeight(req, mockCtx);

    expect(mockSctQuerierTimestampByHeight).toHaveBeenCalledWith(req);
    expect(result as TimestampByHeightResponse).toEqual(mockTimestampByHeighResponse);
  });
});
