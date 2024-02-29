import {
  Action,
  ActionView,
  MemoView,
  Transaction,
  TransactionBodyView,
  TransactionView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import {
  OutputView,
  OutputView_Opaque,
  SpendView,
  SpendView_Opaque,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import {
  SwapClaimView,
  SwapClaimView_Opaque,
  SwapView,
  SwapView_Opaque,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';

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
    case 'swap':
      return new ActionView({
        actionView: {
          case: 'swap',
          value: new SwapView({
            swapView: {
              case: 'opaque',
              value: new SwapView_Opaque({
                swap: action.action.value,
              }),
            },
          }),
        },
      });
    case 'swapClaim':
      return new ActionView({
        actionView: {
          case: 'swapClaim',
          value: new SwapClaimView({
            swapClaimView: {
              case: 'opaque',
              value: new SwapClaimView_Opaque({
                swapClaim: action.action.value,
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
      detectionData: tx.body.detectionData!,
      memoView: new MemoView({
        memoView: tx.body.memo
          ? {
              case: 'opaque',
              value: {
                ciphertext: tx.body.memo,
              },
            }
          : { case: undefined },
      }),
      actionViews: tx.body.actions.map(action => {
        return viewActionFromEmptyPerspective(action)!;
      }),
    }),
    bindingSig: tx.bindingSig!,
    anchor: tx.anchor!,
  });
};
