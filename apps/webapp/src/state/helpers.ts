import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { viewClient } from '../clients/grpc.ts';
import { uint8ArrayToHex } from '@penumbra-zone/types';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1/txhash_pb';
import { sha256Hash } from '@penumbra-zone/crypto-web';
import { Transaction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';

export const getTransactionPlan = async (req: TransactionPlannerRequest) => {
  const { plan } = await viewClient.transactionPlanner(req);
  return plan;
};

export const planWitnessBuildBroadcast = async (
  req: TransactionPlannerRequest,
  options: {
    awaitDetection?: boolean;
    rpcMethod?: 'authorizeAndBuild' | 'witnessAndBuild';
  } = {},
) => {
  const { awaitDetection = true, rpcMethod = 'authorizeAndBuild' } = options;
  const transactionPlan = await getTransactionPlan(req);

  if (!transactionPlan) throw new Error('no plan in response');

  let transaction: Transaction | undefined;
  for await (const { status } of viewClient[rpcMethod]({ transactionPlan }))
    switch (status.case) {
      case 'buildProgress':
        break;
      case 'complete':
        transaction = status.value.transaction;
        break;
      default:
        throw new Error(`unknown authorizeAndBuild status: ${status.case}`);
    }
  if (!transaction) throw new Error('did not build transaction');

  const expectId = new TransactionId({ inner: await sha256Hash(transaction.toBinary()) });

  let detectionHeight: bigint | undefined;
  for await (const { status } of viewClient.broadcastTransaction({ transaction, awaitDetection }))
    switch (status.case) {
      case 'broadcastSuccess':
        if (!expectId.equals(status.value.id)) throw new Error('unexpected transaction id');
        break;
      case 'confirmed':
        detectionHeight = status.value.detectionHeight;
        if (!expectId.equals(status.value.id)) throw new Error('unexpected transaction id');
        break;
      default:
        throw new Error(`unknown broadcastTransaction status: ${status.case}`);
    }
  if (!detectionHeight) throw new Error('did not detect transaction');

  return transaction;
};

export const getTransactionHash = async (transaction: Transaction): Promise<string> =>
  uint8ArrayToHex(await sha256Hash(transaction.toBinary()));
