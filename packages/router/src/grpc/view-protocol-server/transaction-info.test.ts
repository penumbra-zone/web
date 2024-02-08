import { beforeEach, describe, test, vi } from 'vitest';
import { TransactionInfoRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { ServicesInterface } from '@penumbra-zone/types';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { servicesCtx } from '../../ctx';
import { IndexedDbMock, MockServices } from './test-utils';
import { transactionInfo } from './transaction-info';

describe('TransactionInfo request handler', () => {
  let mockServices: MockServices;
  let mockIndexedDb: IndexedDbMock;
  let mockCtx: HandlerContext;

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb = {
      iterateTransactionInfo: vi.fn(),
    };
    mockServices = {
      getWalletServices: vi.fn(() => Promise.resolve({ indexedDb: mockIndexedDb })),
    };
    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.transactionInfo,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      contextValues: createContextValues().set(
        servicesCtx,
        mockServices as unknown as ServicesInterface,
      ),
    });
  });

  test('', async () => {
    transactionInfo(new TransactionInfoRequest(), mockCtx);
  });
});
