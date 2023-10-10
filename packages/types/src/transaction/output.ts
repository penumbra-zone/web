import { z } from 'zod';
import { Base64StringSchema, base64ToUint8Array, InnerBase64Schema } from '../base64';
import { NotePayloadSchema, notePayloadToProto } from './note-payload';
import {
  Output,
  OutputBody,
  ZKOutputProof,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';
import { BalanceCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';

export const OutputSchema = z.object({
  body: z.object({
    balanceCommitment: InnerBase64Schema,
    notePayload: NotePayloadSchema,
    ovkWrappedKey: Base64StringSchema,
    wrappedMemoKey: Base64StringSchema,
  }),
  proof: InnerBase64Schema,
});

export const outputToProto = (o: z.infer<typeof OutputSchema>): Output => {
  return new Output({
    body: new OutputBody({
      balanceCommitment: new BalanceCommitment({
        inner: base64ToUint8Array(o.body.balanceCommitment.inner),
      }),
      notePayload: notePayloadToProto(o.body.notePayload),
      ovkWrappedKey: base64ToUint8Array(o.body.ovkWrappedKey),
      wrappedMemoKey: base64ToUint8Array(o.body.wrappedMemoKey),
    }),
    proof: new ZKOutputProof({ inner: base64ToUint8Array(o.proof.inner) }),
  });
};
