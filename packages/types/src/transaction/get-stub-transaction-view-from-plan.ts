import {
  TransactionPlan,
  TransactionView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

export const getStubTransactionViewFromPlan = (txPlan: TransactionPlan): TransactionView => {
  const returnAddress = txPlan.memoPlan?.plaintext?.returnAddress;
  if (!returnAddress) throw new Error('No return address found in transaction plan');

  const fee = txPlan.fee;
  if (!fee) throw new Error('No fee found in transaction plan');

  return new TransactionView({
    bodyView: {
      actionViews: [],
      fee,
      memoView: {
        memoView: {
          case: 'visible',
          value: {
            plaintext: {
              returnAddress: {
                addressView: {
                  case: 'opaque',
                  value: { address: returnAddress },
                },
              },
              text: txPlan.memoPlan?.plaintext?.text ?? '',
            },
          },
        },
      },
      transactionParameters: { chainId: txPlan.chainId, expiryHeight: txPlan.expiryHeight },
    },
  });
};
