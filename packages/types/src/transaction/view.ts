import {
  TransactionPerspective,
  TransactionView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { z } from 'zod';

// const TxvSchema = z.object({
//   anchor: InnerBase64Schema,
//   bindingSig: Base64StringSchema,
//   bodyView: BodyViewSchema,
// });
// //
// // export type TransactionView = z.infer<typeof TxvSchema>;
//
// export const txViewToProto = (txv: TransactionView): TransactionViewProto => {
//   return new TransactionViewProto({
//     bodyView: bodyViewToProto(txv.bodyView),
//     bindingSig: base64ToUint8Array(txv.bindingSig),
//     anchor: new MerkleRoot({ inner: base64ToUint8Array(txv.anchor.inner) }),
//   });
// };
//
export const TransactionInfoSchema = z.object({
  txp: z.unknown(),
  txv: z.unknown(),
});

export type RawTransactionInfo = z.infer<typeof TransactionInfoSchema>;

export interface TransactionInfo {
  txp: TransactionPerspective;
  txv: TransactionView;
}
