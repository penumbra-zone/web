import { ViewService } from '@penumbra-zone/protobuf';

import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  TransactionInfo,
  TransactionInfoRequest,
  TransactionInfoResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { DbMock, testFullViewingKey } from '../test-utils';
import { transactionInfo } from './transaction-info';
import { fvkCtx } from '../ctx/full-viewing-key';
import { dbCtx } from '../ctx/database';
import { DatabaseCtx } from '../ctx/database';

const mockTransactionInfo = vi.hoisted(() => vi.fn());
vi.mock('@penumbra-zone/wasm/transaction', () => ({
  generateTransactionInfo: mockTransactionInfo,
}));

describe('TransactionInfo request handler', () => {
  let mockCtx: HandlerContext;
  let mockIndexedDb: DbMock;
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

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.transactionInfo,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues()
        .set(dbCtx, () => Promise.resolve(mockIndexedDb as unknown as DatabaseCtx))
        .set(fvkCtx, () => Promise.resolve(testFullViewingKey)),
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
