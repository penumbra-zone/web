import {
  Action,
  ActionView,
  MemoCiphertext,
  MemoView,
  MemoView_Opaque,
  Transaction,
  TransactionBodyView,
  TransactionView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import {
  OutputView,
  OutputView_Opaque,
  SpendView,
  SpendView_Opaque,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';

export const viewActionFromEmptyPerspective = (action: Action): ActionView | undefined => {
  switch (action.action.case) {
    case 'spend':
      return new ActionView({
        actionView: {
          case: 'spend',
          value: new SpendView({
            spendView: {
              case: 'opaque',
              value: new SpendView_Opaque({
                spend: action.action.value,
              }),
            },
          }),
        },
      });
    case 'output':
      return new ActionView({
        actionView: {
          case: 'output',
          value: new OutputView({
            outputView: {
              case: 'opaque',
              value: new OutputView_Opaque({
                output: action.action.value,
              }),
            },
          }),
        },
      });
    default:
      // TODO: fill in other actions. most actions don't have views (they are their own view) so they can be passed through.
      return undefined;
  }
};

// TODO: make this less bad and add round trip tests (should always be able to recover tx exactly from txv)
export const viewFromEmptyPerspective = (tx: Transaction): TransactionView => {
  if (!tx.body) throw new Error('no body in transaction');

  return new TransactionView({
    bodyView: new TransactionBodyView({
      transactionParameters: tx.body.transactionParameters!,
      fee: tx.body.fee!,
      detectionData: tx.body.detectionData!,
      memoView: new MemoView({
        memoView: {
          case: 'opaque',
          value: new MemoView_Opaque({
            ciphertext: new MemoCiphertext({
              /* Why is there MemoCiphertext and MemoData? these are the same thing */
              inner: tx.body.memoData!.encryptedMemo,
            }),
          }),
        },
      }),
      actionViews: tx.body.actions.map(action => {
        return viewActionFromEmptyPerspective(action)!;
      })!,
    }),
    bindingSig: tx.bindingSig,
    anchor: tx.anchor!,
  });
};
