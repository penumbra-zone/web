import { GasPrices } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb';
import {
  GasPricesRequest,
  GasPricesResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { HandlerContext, createContextValues, createHandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { idbCtx } from '../ctx/prax';
import { IndexedDbMock } from '../test-utils';
import { gasPrices } from './gas-prices';

describe('GasPrices request handler', () => {
  let mockIndexedDb: IndexedDbMock;
  let mockCtx: HandlerContext;

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb = {
      getGasPrices: vi.fn(),
    };

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.gasPrices,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(idbCtx, () =>
        Promise.resolve(mockIndexedDb as unknown),
      ),
    });
  });

  test('should successfully get gas prices when idb has them', async () => {
    mockIndexedDb.getGasPrices?.mockResolvedValue(testData);
    const gasPricesResponse = new GasPricesResponse(
      await gasPrices(new GasPricesRequest(), mockCtx),
    );
    expect(gasPricesResponse.gasPrices?.equals(testData)).toBeTruthy();
  });

  test('should fail to get gas prices when idb has none', async () => {
    mockIndexedDb.getGasPrices?.mockResolvedValue(undefined);
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
