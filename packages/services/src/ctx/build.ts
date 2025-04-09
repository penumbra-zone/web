import { createContextKey } from '@connectrpc/connect';
import {
  Action,
  AuthorizationData,
  Transaction,
  TransactionPlan,
  WitnessData,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';

export const buildCtx = createContextKey<{
  buildActions: (
    data: { transactionPlan: TransactionPlan; witnessData: WitnessData },
    signal?: AbortSignal,
  ) => Promise<Action>[];

  buildTransaction: (
    data: {
      transactionPlan: TransactionPlan;
      witnessData: WitnessData;
      actions: Action[];
      authorizationData: AuthorizationData;
    },
    signal?: AbortSignal,
  ) => Promise<Transaction>;
}>(undefined as never);
