import { beforeEach, describe, expect, it, vi } from 'vitest';
import { create, equals, isMessage } from '@bufbuild/protobuf';
import { epochByHeight } from './epoch-by-height.js';
import { IndexedDbMock, MockServices } from '../test-utils.js';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { SctService } from '@penumbra-zone/protobuf';
import { servicesCtx } from '../ctx/prax.js';
import {
  EpochSchema,
  EpochByHeightRequestSchema,
} from '@penumbra-zone/protobuf/penumbra/core/component/sct/v1/sct_pb';
import type { Epoch } from '@penumbra-zone/protobuf/penumbra/core/component/sct/v1/sct_pb';
import type { ServicesInterface } from '@penumbra-zone/types/services';

describe('EpochByHeight request handler', () => {
  let mockServices: MockServices;
  let mockIndexedDb: IndexedDbMock;
  let mockCtx: HandlerContext;

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb = {
      getEpochByHeight: vi.fn(),
    };
    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({ indexedDb: mockIndexedDb }),
      ) as MockServices['getWalletServices'],
    };
    mockCtx = createHandlerContext({
      service: SctService,
      method: SctService.method.epochByHeight,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(servicesCtx, () =>
        Promise.resolve(mockServices as unknown as ServicesInterface),
      ),
    });
  });

  it('returns an `EpochByHeightResponse` with the result of the database query', async () => {
    const expected = create(EpochSchema, { startHeight: 0n, index: 0n });

    mockIndexedDb.getEpochByHeight?.mockResolvedValue(expected);
    const req = create(EpochByHeightRequestSchema, { height: 0n });

    const result = await epochByHeight(req, mockCtx);

    expect(isMessage(result.epoch, EpochSchema)).toBeTruthy();
    expect(equals(EpochSchema, result.epoch as Epoch, expected)).toBeTruthy();
  });
});
