import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  FMDParametersRequest,
  FMDParametersResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import { servicesCtx } from '../ctx/prax.js';
import { IndexedDbMock, MockServices } from '../test-utils.js';
import { FmdParameters } from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import { fMDParameters } from './fmd-parameters.js';
import type { ServicesInterface } from '@penumbra-zone/types/services';

describe('FmdParameters request handler', () => {
  let mockServices: MockServices;
  let mockIndexedDb: IndexedDbMock;
  let mockCtx: HandlerContext;

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb = {
      getFmdParams: vi.fn(),
    };
    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({ indexedDb: mockIndexedDb }),
      ) as MockServices['getWalletServices'],
    };
    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.fMDParameters,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(servicesCtx, () =>
        Promise.resolve(mockServices as unknown as ServicesInterface),
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
