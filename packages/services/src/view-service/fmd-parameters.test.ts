import { FmdParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import {
  FMDParametersRequest,
  FMDParametersResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { HandlerContext, createContextValues, createHandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { idbCtx } from '../ctx/prax';
import { IndexedDbMock } from '../test-utils';
import { fMDParameters } from './fmd-parameters';

describe('FmdParameters request handler', () => {
  let mockIndexedDb: IndexedDbMock;
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
      contextValues: createContextValues().set(idbCtx, () =>
        Promise.resolve(mockIndexedDb as unknown),
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
