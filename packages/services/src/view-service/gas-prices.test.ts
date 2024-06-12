import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  GasPricesRequest,
  GasPricesResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';

import { GasPrices } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb';
import { gasPrices } from './gas-prices';
import { DatabaseCtx } from '../ctx/database';
import { dbCtx } from '../ctx/database';
import { mockIndexedDb } from '../test-utils';

describe('GasPrices request handler', () => {
  let mockCtx: HandlerContext;

  beforeEach(() => {
    vi.resetAllMocks();

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.gasPrices,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(dbCtx, () =>
        Promise.resolve(mockIndexedDb as unknown as DatabaseCtx),
      ),
    });
  });

  test('should successfully get gas prices when idb has them', async () => {
    mockIndexedDb.getGasPrices.mockResolvedValue(testData);
    const gasPricesResponse = new GasPricesResponse(
      await gasPrices(new GasPricesRequest(), mockCtx),
    );
    expect(gasPricesResponse.gasPrices?.equals(testData)).toBeTruthy();
  });

  test('should fail to get gas prices when idb has none', async () => {
    mockIndexedDb.getGasPrices.mockResolvedValue(undefined);
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
