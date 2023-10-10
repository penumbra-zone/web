import { z } from 'zod';
import { Base64StringSchema, base64ToUint8Array, InnerBase64Schema } from '../../base64';
import { Action } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import {
  OutputBody,
  ZKOutputProof,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';
import { BalanceCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { NotePayloadSchema, notePayloadToProto } from '../note-payload';

export const OutputSchema = z.object({
  body: z.object({
    balanceCommitment: InnerBase64Schema,
    notePayload: NotePayloadSchema,
    ovkWrappedKey: Base64StringSchema,
    wrappedMemoKey: Base64StringSchema,
  }),
  proof: InnerBase64Schema,
});

type Output = z.infer<typeof OutputSchema>;

export const outputToProto = (o: Output): Action =>
  new Action({
    action: {
      case: 'output',
      value: {
        body: new OutputBody({
          balanceCommitment: new BalanceCommitment({
            inner: base64ToUint8Array(o.body.balanceCommitment.inner),
          }),
          notePayload: notePayloadToProto(o.body.notePayload),
          ovkWrappedKey: base64ToUint8Array(o.body.ovkWrappedKey),
          wrappedMemoKey: base64ToUint8Array(o.body.wrappedMemoKey),
        }),
        proof: new ZKOutputProof({ inner: base64ToUint8Array(o.proof.inner) }),
      },
    },
  });
