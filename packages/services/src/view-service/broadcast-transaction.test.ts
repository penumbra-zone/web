import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  BroadcastTransactionRequest,
  BroadcastTransactionResponse,
  TransactionInfo,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import {
  createContextValues,
  createHandlerContext,
  createRouterTransport,
  HandlerContext,
} from '@connectrpc/connect';
import { TendermintProxyService, ViewService } from '@penumbra-zone/protobuf';

import { broadcastTransaction } from './broadcast-transaction';

import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1/txhash_pb';

import { dbCtx } from '../ctx/database';
import { DatabaseCtx } from '../ctx/database';
import mockJson from './broadcast-transaction.test.json';
import { Transaction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { JsonValue } from '@bufbuild/protobuf';
import { fullnodeCtx } from '../ctx/fullnode';
import { mockIndexedDb, mockTendermintService } from '../test-utils';

const mockTransactionId = TransactionId.fromJson(mockJson.transactionId);
const mockTransaction = Transaction.fromJson(mockJson.transaction as unknown as JsonValue);

const mockSha256 = vi.hoisted(() => vi.fn());
vi.mock('@penumbra-zone/crypto-web/sha256', () => ({
  sha256Hash: mockSha256,
}));

describe('BroadcastTransaction request handler', () => {
  let mockCtx: HandlerContext;
  let broadcastTransactionRequest: BroadcastTransactionRequest;

  beforeEach(() => {
    vi.resetAllMocks();

    mockSha256.mockImplementation(() => mockTransactionId.inner);

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.broadcastTransaction,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues()
        .set(dbCtx, () => Promise.resolve(mockIndexedDb as unknown as DatabaseCtx))
        .set(fullnodeCtx, () =>
          Promise.resolve(
            createRouterTransport(({ service }) =>
              service(TendermintProxyService, mockTendermintService),
            ),
          ),
        ),
    });

    broadcastTransactionRequest = new BroadcastTransactionRequest({
      transaction: mockTransaction,
    });
  });

  test('should successfully broadcastTransaction without await detection', async () => {
    const broadcastResponses: BroadcastTransactionResponse[] = [];
    mockTendermintService.broadcastTxSync.mockResolvedValue({ hash: mockTransactionId.inner });
    for await (const response of broadcastTransaction(broadcastTransactionRequest, mockCtx)) {
      broadcastResponses.push(new BroadcastTransactionResponse(response));
    }
    expect(broadcastResponses.length === 1).toBeTruthy();
    expect(broadcastResponses[0]?.status.case === 'broadcastSuccess').toBeTruthy();
  });

  test('should successfully broadcastTransaction with await detection', async () => {
    const detectionHeight = 222n;
    const txRecord = new TransactionInfo({
      transaction: mockTransaction,
      height: detectionHeight,
      id: mockTransactionId,
    });
    mockTendermintService.broadcastTxSync.mockResolvedValue({ hash: mockTransactionId.inner });

    mockIndexedDb.subscribeTransactionInfo.mockImplementation(async function* () {
      yield await Promise.resolve(txRecord);
    });

    broadcastTransactionRequest.awaitDetection = true;

    const broadcastResponses: BroadcastTransactionResponse[] = [];
    for await (const response of broadcastTransaction(broadcastTransactionRequest, mockCtx)) {
      broadcastResponses.push(new BroadcastTransactionResponse(response));
    }
    expect(broadcastResponses.length === 2).toBeTruthy();
    expect(broadcastResponses[0]?.status.case === 'broadcastSuccess').toBeTruthy();
    expect(broadcastResponses[1]?.status.case === 'confirmed').toBeTruthy();
    expect(broadcastResponses[1]?.status.value?.id?.equals(mockTransactionId)).toBeTruthy();
  });

  test('should throw error if broadcast transaction id disagrees', async () => {
    mockTendermintService.broadcastTxSync.mockResolvedValue({ hash: new Uint8Array() });
    await expect(
      (async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _ of broadcastTransaction(broadcastTransactionRequest, mockCtx));
      })(),
    ).rejects.toThrow('broadcast transaction id disagrees');
  });

  test('should throw error if broadcast transaction fails', async () => {
    mockTendermintService.broadcastTxSync.mockRejectedValue({ code: 1n, log: 'Mock Failure' });
    await expect(
      (async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _ of broadcastTransaction(broadcastTransactionRequest, mockCtx));
      })(),
    ).rejects.toThrow();
  });
});
