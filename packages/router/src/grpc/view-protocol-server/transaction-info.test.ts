import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { servicesCtx } from '../../ctx/prax';

import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  TransactionInfo,
  TransactionInfoRequest,
  TransactionInfoResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { IndexedDbMock, MockServices, ViewServerMock } from '../test-utils';
import { Services } from '@penumbra-zone/services/src/index';
import { transactionInfo } from './transaction-info';

const mockTransactionInfo = vi.hoisted(() => vi.fn());
vi.mock('@penumbra-zone/wasm/src/transaction', () => ({
  generateTransactionInfo: mockTransactionInfo,
}));

describe('TransactionInfo request handler', () => {
  let mockServices: MockServices;
  let mockCtx: HandlerContext;
  let mockIndexedDb: IndexedDbMock;
  let mockViewServer: ViewServerMock;
  let req: TransactionInfoRequest;

  beforeEach(() => {
    vi.resetAllMocks();

    const mockIterateTransactionInfo = {
      next: vi.fn(),
      [Symbol.asyncIterator]: () => mockIterateTransactionInfo,
    };

    mockIndexedDb = {
      iterateTransactions: () => mockIterateTransactionInfo,
      constants: vi.fn(),
    };

    mockViewServer = {
      fullViewingKey:
        'penumbrafullviewingkey1vzfytwlvq067g2kz095vn7sgcft47hga40atrg5zu2crskm6tyyjysm28qg5nth2fqmdf5n0q530jreumjlsrcxjwtfv6zdmfpe5kqsa5lg09',
    };

    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({ indexedDb: mockIndexedDb, viewServer: mockViewServer }),
      ) as MockServices['getWalletServices'],
    };

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.transactionInfo,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(servicesCtx, mockServices as unknown as Services),
    });

    mockTransactionInfo.mockReturnValue({
      txp: {},
      txv: {},
    });

    for (const record of testData) {
      mockIterateTransactionInfo.next.mockResolvedValueOnce({
        value: record,
      });
    }
    mockIterateTransactionInfo.next.mockResolvedValueOnce({
      done: true,
    });
    req = new TransactionInfoRequest();
  });

  test('should get all transactions if startHeight and endHeight are not set in request', async () => {
    const responses: TransactionInfoResponse[] = [];
    for await (const res of transactionInfo(req, mockCtx)) {
      responses.push(new TransactionInfoResponse(res));
    }
    expect(responses.length).toBe(4);
  });

  test('should get only transactions whose height is not greater than endHeight', async () => {
    const responses: TransactionInfoResponse[] = [];
    req.endHeight = 2525n;
    for await (const res of transactionInfo(req, mockCtx)) {
      responses.push(new TransactionInfoResponse(res));
    }
    expect(responses.length).toBe(3);
  });

  test('should receive only transactions whose height is not less than startHeight', async () => {
    const responses: TransactionInfoResponse[] = [];
    req.startHeight = 2525n;
    for await (const res of transactionInfo(req, mockCtx)) {
      responses.push(new TransactionInfoResponse(res));
    }
    expect(responses.length).toBe(2);
  });

  test('should receive only transactions whose height is between startHeight and endHeight inclusive', async () => {
    const responses: TransactionInfoResponse[] = [];
    req.startHeight = 998n;
    req.endHeight = 2525n;
    for await (const res of transactionInfo(req, mockCtx)) {
      responses.push(new TransactionInfoResponse(res));
    }
    expect(responses.length).toBe(2);
  });
});

const testData: TransactionInfo[] = [
  TransactionInfo.fromJson({
    height: '222',
    id: {
      inner: '1MI8IG5D3MQj3s1j0MXTwCQtAaVbwTlPkW8Qdz1EVIo=',
    },
    transaction: {},
  }),
  TransactionInfo.fromJson({
    height: '1000',
    id: {
      inner: '2MI8IG5D3MQj3s1j0MXTwCQtAaVbwTlPkW8Qdz1EVIo=',
    },
    transaction: {},
  }),
  TransactionInfo.fromJson({
    height: '2525',
    id: {
      inner: '3MI8IG5D3MQj3s1j0MXTwCQtAaVbwTlPkW8Qdz1EVIo=',
    },
    transaction: {},
  }),
  TransactionInfo.fromJson({
    height: '12255',
    id: {
      inner: '4MI8IG5D3MQj3s1j0MXTwCQtAaVbwTlPkW8Qdz1EVIo=',
    },
    transaction: {},
  }),
];
