import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import {
  TransactionInfo,
  TransactionInfoRequest,
  TransactionInfoResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import type { ServicesInterface } from '@penumbra-zone/types/services';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { fvkCtx } from '../ctx/full-viewing-key.js';
import { servicesCtx } from '../ctx/prax.js';
import { mockIndexedDb, MockServices, testFullViewingKey } from '../test-utils.js';
import { transactionInfo } from './transaction-info.js';

const mockTransactionInfo = vi.hoisted(() => vi.fn());
const mockTransactionSummary = vi.hoisted(() => vi.fn());
const mockSaveTransactionInfo = vi.hoisted(() => vi.fn());
vi.mock('@penumbra-zone/wasm/transaction', () => ({
  generateTransactionInfo: mockTransactionInfo,
  generateTransactionSummary: mockTransactionSummary,
  saveTransactionInfo: mockSaveTransactionInfo,
}));

describe('TransactionInfo request handler', () => {
  let mockServices: MockServices;
  let mockCtx: HandlerContext;
  let req: TransactionInfoRequest;

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb.iterateTransactions.mockImplementationOnce(async function* () {
      yield* await Promise.resolve(testData);
    });

    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({ indexedDb: mockIndexedDb }),
      ) as MockServices['getWalletServices'],
    };

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.transactionInfo,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues()
        .set(servicesCtx, () => Promise.resolve(mockServices as unknown as ServicesInterface))
        .set(fvkCtx, () => Promise.resolve(testFullViewingKey)),
    });

    mockTransactionInfo.mockReturnValue({
      txp: {},
      txv: {},
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
    expect(responses.length).toBe(4);
  });

  test('should receive only transactions whose height is not less than startHeight', async () => {
    const responses: TransactionInfoResponse[] = [];
    req.startHeight = 2525n;
    for await (const res of transactionInfo(req, mockCtx)) {
      responses.push(new TransactionInfoResponse(res));
    }
    expect(responses.length).toBe(4);
  });

  test('should receive only transactions whose height is between startHeight and endHeight inclusive', async () => {
    const responses: TransactionInfoResponse[] = [];
    req.startHeight = 998n;
    req.endHeight = 2525n;
    for await (const res of transactionInfo(req, mockCtx)) {
      responses.push(new TransactionInfoResponse(res));
    }
    expect(responses.length).toBe(4);
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
