import {
  TransactionPerspective,
  TransactionView,
  Transaction,
  TransactionBodyView,
  MemoView,
  MemoView_Opaque,
  MemoCiphertext,
  Action,
  ActionView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { z } from 'zod';
import { Base64StringSchema, InnerBase64Schema } from './base64';
import { OutputView, OutputView_Opaque, SpendView, SpendView_Opaque } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';

export const WasmTransactionInfoSchema = z.object({
  txp: z.unknown(),
  txv: z.unknown(),
});

export interface WasmTransactionInfo {
  txp: TransactionPerspective;
  txv: TransactionView;
}

export const WasmAuthorizeSchema = z.object({
  effectHash: InnerBase64Schema,
  spendAuths: z.array(InnerBase64Schema),
});

const SctProofSchema = z.object({
  authPath: z.array(
    z.object({
      sibling1: Base64StringSchema,
      sibling2: Base64StringSchema,
      sibling3: Base64StringSchema,
    }),
  ),
  noteCommitment: InnerBase64Schema,
  position: z.string(),
});

export const WasmWitnessDataSchema = z.object({
  anchor: InnerBase64Schema,
  stateCommitmentProofs: z.array(SctProofSchema),
});

export const WasmBuildSchema = z.object({
  anchor: InnerBase64Schema,
  bindingSig: Base64StringSchema,
  body: z.object({
    actions: z.array(z.unknown()),
    detectionData: z.unknown(),
    fee: z.unknown(),
    memoData: z.unknown(),
    transactionParameters: z.unknown(),
  }),
});

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
            }
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
            }
          }),
        },
      });
  }
  // TODO: fill in other actions. most actions don't have views (they are their own view) so they can be passed through.
  return undefined;
}

// TODO: make this less bad and add round trip tests (should always be able to recover tx exactly from txv)
export const viewFromEmptyPerspective = (tx: Transaction): TransactionView => {
  // this code is very exciting !!!!
  // that's why it has so mayny exclamation marks !!!!!
  const txv = new TransactionView({
    bodyView: new TransactionBodyView({
      transactionParameters: tx.body?.transactionParameters!,
      fee: tx.body?.fee!,
      detectionData: tx.body?.detectionData!,
      memoView: new MemoView({
        memoView: {
          case: "opaque",
          value: new MemoView_Opaque({
            ciphertext: new MemoCiphertext({
              /* Why is there MemoCiphertext and MemoData? these ar ethe same thing */
              inner: tx.body?.memoData?.encryptedMemo!,
            })
          })
        }
      }),
      actionViews: tx.body?.actions?.map(action => {
        return viewActionFromEmptyPerspective(action)!;
      })!,
    }),
    bindingSig: tx.bindingSig!,
    anchor: tx.anchor!,
  });

  return txv;
};
