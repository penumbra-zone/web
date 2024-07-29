import { asOpaqueMemoView, asReceiverMemoView } from './memo-view.js';
import { asPublicActionView, asReceiverActionView } from './action-view.js';
import { TransactionView, Address } from '@penumbra-zone/protobuf/types';
import { Translator } from './types.js';

export const asPublicTransactionView: Translator<TransactionView> = transactionView => {
  if (!transactionView?.bodyView) {
    return new TransactionView();
  }

  return new TransactionView({
    bodyView: {
      memoView: asOpaqueMemoView(transactionView.bodyView.memoView),
      actionViews: transactionView.bodyView.actionViews.map(asPublicActionView),

      ...(transactionView.bodyView.transactionParameters
        ? { transactionParameters: transactionView.bodyView.transactionParameters }
        : {}),
    },
  });
};

export const asReceiverTransactionView: Translator<
  TransactionView,
  Promise<TransactionView>,
  { isControlledAddress: (address: Address) => Promise<boolean> }
> = async (transactionView, ctx) => {
  if (!transactionView?.bodyView) {
    return new TransactionView();
  }

  return new TransactionView({
    bodyView: {
      memoView: asReceiverMemoView(transactionView.bodyView.memoView),
      actionViews: await Promise.all(
        transactionView.bodyView.actionViews.map(actionView =>
          asReceiverActionView(actionView, ctx),
        ),
      ),

      ...(transactionView.bodyView.transactionParameters
        ? { transactionParameters: transactionView.bodyView.transactionParameters }
        : {}),
    },
  });
};
