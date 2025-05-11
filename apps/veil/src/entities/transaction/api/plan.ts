import { PartialMessage } from '@bufbuild/protobuf';
import { TransactionPlannerRequest } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { TransactionPlan } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '@/shared/const/penumbra';

export const planTransaction = async (
  req: PartialMessage<TransactionPlannerRequest>,
): Promise<TransactionPlan> => {
  const { plan } = await penumbra.service(ViewService).transactionPlanner(req);
  if (!plan) {
    throw new Error('No plan in planner response');
  }
  return plan;
};
