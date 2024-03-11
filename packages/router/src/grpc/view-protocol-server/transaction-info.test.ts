import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { servicesCtx } from '../../ctx';

import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  TransactionInfoRequest,
  TransactionInfoResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { IndexedDbMock, MockServices, ViewServerMock } from '../test-utils';
import { Services } from '@penumbra-zone/services';
import { transactionInfo } from './transaction-info';
import { TransactionRecord } from '@penumbra-zone/types';
import { Transaction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1/txhash_pb';

const mockTransactionInfo = vi.hoisted(() => vi.fn());
vi.mock('@penumbra-zone/wasm', () => ({
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
      fullViewingKey: vi.fn(),
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

    mockViewServer.fullViewingKey?.mockReturnValueOnce(
      'penumbrafullviewingkey1vzfytwlvq067g2kz095vn7sgcft47hga40atrg5zu2crskm6tyyjysm28qg5nth2fqmdf5n0q530jreumjlsrcxjwtfv6zdmfpe5kqsa5lg09',
    );

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

const testData: TransactionRecord[] = [
  {
    height: 222n,
    id: TransactionId.fromJson({
      inner: '1MI8IG5D3MQj3s1j0MXTwCQtAaVbwTlPkW8Qdz1EVIo=',
    }),
    transaction: Transaction.fromJson({}),
  },
  {
    height: 1000n,
    id: TransactionId.fromJson({
      inner: '2MI8IG5D3MQj3s1j0MXTwCQtAaVbwTlPkW8Qdz1EVIo=',
    }),
    transaction: Transaction.fromJson({}),
  },
  {
    height: 2525n,
    id: TransactionId.fromJson({
      inner: '3MI8IG5D3MQj3s1j0MXTwCQtAaVbwTlPkW8Qdz1EVIo=',
    }),
    transaction: Transaction.fromJson({}),
  },
  {
    height: 12255n,
    id: TransactionId.fromJson({
      inner: '4MI8IG5D3MQj3s1j0MXTwCQtAaVbwTlPkW8Qdz1EVIo=',
    }),
    transaction: Transaction.fromJson({}),
  },
];
