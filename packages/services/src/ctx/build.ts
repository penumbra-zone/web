import { createContextKey } from '@connectrpc/connect';
import {
  Action,
  AuthorizationData,
  Transaction,
  TransactionPlan,
  WitnessData,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';

/**
 * Build transactions.
 */
export const buildCtx = createContextKey<{
  buildActions: (
    data: { transactionPlan: TransactionPlan; witnessData: WitnessData },
    signal?: AbortSignal,
  ) => Promise<Promise<Action>[]>;

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
