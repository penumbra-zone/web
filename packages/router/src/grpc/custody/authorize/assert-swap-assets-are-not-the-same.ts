import { TransactionPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { Code, ConnectError } from '@connectrpc/connect';

export const assertSwapAssetsAreNotTheSame = (transactionPlan: TransactionPlan) => {
  transactionPlan.actions.forEach(action => {
    if (action.action.case !== 'swap') return;

    if (
      action.action.value.swapPlaintext?.tradingPair?.asset1?.equals(
        action.action.value.swapPlaintext.tradingPair.asset2,
      )
    ) {
      throw new ConnectError(
        'Attempted to make a swap in which both assets were of the same type. A swap must be between two different asset types.',
        Code.InvalidArgument,
      );
    }
  });
};
