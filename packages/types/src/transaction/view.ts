import { z } from 'zod';
import { Base64StringSchema, base64ToUint8Array, InnerBase64Schema } from '../base64';
import { TxpSchema } from './perspective';
import { TransactionView as TransactionViewProto } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { MerkleRoot } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1alpha1/tct_pb';
import { BodyViewSchema, bodyViewToProto } from './body-view';

const TxvSchema = z.object({
  anchor: InnerBase64Schema,
  bindingSig: Base64StringSchema,
  bodyView: BodyViewSchema,
});

export type TransactionView = z.infer<typeof TxvSchema>;

export const txViewToProto = (txv: TransactionView): TransactionViewProto => {
  return new TransactionViewProto({
    bodyView: bodyViewToProto(txv.bodyView),
    bindingSig: base64ToUint8Array(txv.bindingSig),
    anchor: new MerkleRoot({ inner: base64ToUint8Array(txv.anchor.inner) }),
  });
};

export const TransactionInfoSchema = z.object({
  txp: TxpSchema,
  txv: TxvSchema,
});

export type TransactionInfo = z.infer<typeof TransactionInfoSchema>;
