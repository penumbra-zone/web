import {
  Transaction,
  TransactionPerspective,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1/txhash_pb';
import {
  TransactionInfo,
  TransactionInfoByHashRequest,
  TransactionInfoByHashResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { JsonValue } from '@bufbuild/protobuf';
import {
  HandlerContext,
  createContextValues,
  createHandlerContext,
  createRouterTransport,
} from '@connectrpc/connect';
import { TendermintProxyService, ViewService } from '@penumbra-zone/protobuf';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { DatabaseCtx, dbCtx } from '../ctx/database';
import { fvkCtx } from '../ctx/full-viewing-key';
import { fullnodeCtx } from '../ctx/fullnode';
import { mockIndexedDb, mockTendermintService, testFullViewingKey } from '../test-utils';
import { transactionInfoByHash } from './transaction-info-by-hash';
import mockJson from './transaction-info-by-hash.test.json';

const mockTransactionId = TransactionId.fromJson(mockJson.transactionId);
const mockTransactionPerspective = TransactionPerspective.fromJson(mockJson.transactionPerspective);
const mockTransaction = Transaction.fromJson(mockJson.transaction as unknown as JsonValue);

const mockTransactionInfo = vi.hoisted(() => vi.fn());
vi.mock('@penumbra-zone/wasm/transaction', () => ({
  generateTransactionInfo: mockTransactionInfo,
}));
describe('TransactionInfoByHash request handler', () => {
  let mockCtx: HandlerContext;

  beforeEach(() => {
    vi.resetAllMocks();

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.transactionInfoByHash,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues()
        .set(dbCtx, () => Promise.resolve(mockIndexedDb as unknown as DatabaseCtx))
        .set(fvkCtx, () => Promise.resolve(testFullViewingKey))
        .set(fullnodeCtx, () =>
          Promise.resolve(
            createRouterTransport(({ service }) =>
              service(TendermintProxyService, mockTendermintService),
            ),
          ),
        ),
    });
    mockTransactionInfo.mockReturnValueOnce({
      txp: mockTransactionPerspective,
      txv: {},
    });
  });

  test('should get TransactionInfo from indexed-db if there is a record in indexed-db', async () => {
    mockIndexedDb.getTransaction.mockResolvedValue(
      new TransactionInfo({
        height: 22n,
        id: mockTransactionId,
        transaction: mockTransaction,
      }),
    );
    const txInfoByHashResponse = new TransactionInfoByHashResponse(
      await transactionInfoByHash(
        new TransactionInfoByHashRequest({ id: mockTransactionId }),
        mockCtx,
      ),
    );

    expect(txInfoByHashResponse.txInfo?.transaction?.equals(mockTransaction)).toBeTruthy();
  });

  test('should get TransactionInfo from tendermint if record is not found in indexed-db', async () => {
    mockIndexedDb.getTransaction.mockResolvedValue(undefined);
    mockTendermintService.getTx.mockResolvedValue({
      height: 22n,
      tx: mockTransaction.toBinary(),
    });

    const txInfoByHashResponse = new TransactionInfoByHashResponse(
      await transactionInfoByHash(
        new TransactionInfoByHashRequest({ id: mockTransactionId }),
        mockCtx,
      ),
    );
    expect(mockTendermintService.getTx).toHaveBeenCalled();
    console.log('mockTransaction', mockTransaction);
    console.log(
      'txInfoByHashResponse.txInfo?.transaction',
      txInfoByHashResponse.txInfo?.transaction,
    );
    expect(mockTransaction.equals(txInfoByHashResponse.txInfo?.transaction)).toBeTruthy();
  });

  test('should get an error if TransactionId is not passed', async () => {
    await expect(
      transactionInfoByHash(new TransactionInfoByHashRequest(), mockCtx),
    ).rejects.toThrow('Missing transaction ID in request');
  });
});
