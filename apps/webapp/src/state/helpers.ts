import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { viewClient } from '../clients/grpc.ts';
import { uint8ArrayToHex } from '@penumbra-zone/types';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1alpha1/txhash_pb';
import { sha256Hash } from '@penumbra-zone/crypto-web';

export const planWitnessBuildBroadcast = async (
  req: TransactionPlannerRequest,
  awaitDetection = true,
) => {
  const { plan: transactionPlan } = await viewClient.transactionPlanner(req);

  if (!transactionPlan) throw new Error('no plan in response');

  let transaction;
  for await (const { status } of viewClient.authorizeAndBuild({ transactionPlan })) {
    switch (status.case) {
      case 'buildProgress':
        console.log('buildProgress', status.value.progress);
        break;
      case 'complete':
        transaction = status.value.transaction;
        break;
      default:
        throw new Error(`unknown authorizeAndBuild status: ${status.case}`);
    }
  }
  if (!transaction) throw new Error('did not build transaction');

  const broadcastStream = viewClient.broadcastTransaction({ transaction, awaitDetection });

  const expectId = new TransactionId({ inner: await sha256Hash(transaction.toBinary()) });

  let detectionHeight;

  for await (const { status } of broadcastStream) {
    switch (status.case) {
      case 'broadcastSuccess':
        console.log('broadcastSuccess', status.value);
        if (!expectId.equals(status.value.id)) throw new Error('unexpected transaction id');
        break;
      case 'confirmed':
        detectionHeight = status.value.detectionHeight;
        if (!expectId.equals(status.value.id)) throw new Error('unexpected transaction id');
        break;
      default:
        throw new Error(`unknown broadcastTransaction status: ${status.case}`);
    }
  }

  if (awaitDetection && !detectionHeight) throw new Error('did not detect transaction');

  return uint8ArrayToHex(expectId.inner);
};
