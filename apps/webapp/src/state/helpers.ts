import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { viewClient } from '../clients/grpc.ts';
import { uint8ArrayToHex } from '@penumbra-zone/types';

export const planWitnessBuildBroadcast = async (req: TransactionPlannerRequest) => {
  const { plan } = await viewClient.transactionPlanner(req);
  if (!plan) throw new Error('no plan in response');

  const { transaction } = await viewClient.authorizeAndBuild({
    transactionPlan: plan,
  });
  if (!transaction) throw new Error('no transaction in response');

  const { id } = await viewClient.broadcastTransaction({ transaction, awaitDetection: true });
  if (!id) throw new Error('no id in broadcast response');

  return uint8ArrayToHex(id.inner);
};
