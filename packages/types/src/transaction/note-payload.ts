import { z } from 'zod';
import { Base64StringSchema, base64ToUint8Array, InnerBase64Schema } from '../base64';
import {
  NoteCiphertext,
  NotePayload as NotePayloadProto,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1alpha1/tct_pb';

export const NotePayloadSchema = z.object({
  encryptedNote: InnerBase64Schema,
  ephemeralKey: Base64StringSchema,
  noteCommitment: InnerBase64Schema,
});

type NotePayload = z.infer<typeof NotePayloadSchema>;

export const notePayloadToProto = (n: NotePayload): NotePayloadProto =>
  new NotePayloadProto({
    encryptedNote: new NoteCiphertext({ inner: base64ToUint8Array(n.encryptedNote.inner) }),
    ephemeralKey: base64ToUint8Array(n.ephemeralKey),
    noteCommitment: new StateCommitment({ inner: base64ToUint8Array(n.noteCommitment.inner) }),
  });
