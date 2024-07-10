import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  GasPricesRequest,
  GasPricesResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import { servicesCtx } from '../ctx/prax.js';
import { IndexedDbMock, MockServices } from '../test-utils.js';
import { GasPrices } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb.js';
import { gasPrices } from './gas-prices.js';
import type { ServicesInterface } from '@penumbra-zone/types/services';

describe('GasPrices request handler', () => {
  let mockServices: MockServices;
  let mockIndexedDb: IndexedDbMock;
  let mockCtx: HandlerContext;

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb = {
      getNativeGasPrices: vi.fn(),
      getAltGasPrices: vi.fn(),
    };
    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({ indexedDb: mockIndexedDb }),
      ) as MockServices['getWalletServices'],
    };
    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.gasPrices,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(servicesCtx, () =>
        Promise.resolve(mockServices as unknown as ServicesInterface),
      ),
    });
  });

  test('should successfully get gas prices when idb has them', async () => {
    mockIndexedDb.getNativeGasPrices?.mockResolvedValue(testData);
    const gasPricesResponse = new GasPricesResponse(
      await gasPrices(new GasPricesRequest(), mockCtx),
    );
    expect(gasPricesResponse.gasPrices?.equals(testData)).toBeTruthy();
  });

  test('should fail to get gas prices when idb has none', async () => {
    mockIndexedDb.getNativeGasPrices?.mockResolvedValue(undefined);
    await expect(gasPrices(new GasPricesRequest(), mockCtx)).rejects.toThrow(
      'Gas prices is not available',
    );
  });
});

const testData = new GasPrices({
  blockSpacePrice: 22n,
  executionPrice: 12n,
  verificationPrice: 222n,
  compactBlockSpacePrice: 122n,
});
