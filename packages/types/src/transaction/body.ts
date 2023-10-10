import { z } from 'zod';
import { Base64StringSchema, base64ToUint8Array, InnerBase64Schema } from '../base64';
import {
  DetectionData,
  MemoData,
  TransactionBody,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { Clue } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/decaf377_fmd/v1alpha1/decaf377_fmd_pb';
import { ActionSchema, actionsToProto } from './actions';

export const BodySchema = z.object({
  actions: z.array(ActionSchema),
  detectionData: z.object({
    fmdClues: z.array(InnerBase64Schema),
  }),
  fee: z.object({
    amount: z.object({}),
  }),
  memoData: z.object({
    encryptedMemo: Base64StringSchema,
  }),
  transactionParameters: z.object({
    chainId: z.string(),
  }),
});

type TxBody = z.infer<typeof BodySchema>;

export const txBodyToProto = (body: TxBody): TransactionBody => {
  return new TransactionBody({
    actions: actionsToProto(body.actions),
    transactionParameters: body.transactionParameters,
    fee: body.fee,
    detectionData: new DetectionData({
      fmdClues: body.detectionData.fmdClues.map(
        c => new Clue({ inner: base64ToUint8Array(c.inner) }),
      ),
    }),
    memoData: new MemoData({
      encryptedMemo: base64ToUint8Array(body.memoData.encryptedMemo),
    }),
  });
};
