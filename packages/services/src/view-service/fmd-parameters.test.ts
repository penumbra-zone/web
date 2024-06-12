import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  FMDParametersRequest,
  FMDParametersResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import { DbMock } from '../test-utils';
import { FmdParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import { fMDParameters } from './fmd-parameters';
import { DatabaseCtx } from '../ctx/database';
import { dbCtx } from '../ctx/database';

describe('FmdParameters request handler', () => {
  let mockIndexedDb: DbMock;
  let mockCtx: HandlerContext;

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb = {
      getFmdParams: vi.fn(),
    };

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.fMDParameters,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(dbCtx, () =>
        Promise.resolve(mockIndexedDb as unknown as DatabaseCtx),
      ),
    });
  });

  test('should successfully get fmdParameters when idb has them', async () => {
    mockIndexedDb.getFmdParams?.mockResolvedValue(testData);
    const fmdParameterResponse = new FMDParametersResponse(
      await fMDParameters(new FMDParametersRequest(), mockCtx),
    );
    expect(fmdParameterResponse.parameters?.equals(testData)).toBeTruthy();
  });

  test('should fail to get fmdParameters when idb has none', async () => {
    mockIndexedDb.getFmdParams?.mockResolvedValue(undefined);
    await expect(fMDParameters(new FMDParametersRequest(), mockCtx)).rejects.toThrow();
  });
});

const testData = new FmdParameters({ asOfBlockHeight: 1n, precisionBits: 0 });
