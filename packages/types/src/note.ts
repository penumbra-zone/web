import { z } from 'zod';
import { Base64StringSchema, base64ToUint8Array, InnerBase64Schema } from './base64';
import { Note } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';
import {
  AssetId,
  Value,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { AmountSchema, amountToProto } from './amount';

export const NoteValueSchema = z.object({
  amount: AmountSchema,
  assetId: InnerBase64Schema,
});

export const NoteSchema = z.object({
  value: NoteValueSchema,
  rseed: Base64StringSchema,
  address: InnerBase64Schema,
});

const noteValToProto = (v: z.infer<typeof NoteValueSchema>): Value => {
  return new Value({
    amount: amountToProto(v.amount),
    assetId: new AssetId({ inner: base64ToUint8Array(v.assetId.inner) }),
  });
};

export const noteToProto = (n: z.infer<typeof NoteSchema>): Note => {
  return new Note({
    value: noteValToProto(n.value),
    rseed: base64ToUint8Array(n.rseed),
    address: { inner: base64ToUint8Array(n.address.inner) },
  });
};

export const notesToProto = (notes: z.infer<typeof NoteSchema>[]): Note[] => notes.map(noteToProto);
