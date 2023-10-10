// export const NotePayloadSchema = z.object({
//   encryptedNote: InnerBase64Schema,
//   ephemeralKey: Base64StringSchema,
//   noteCommitment: InnerBase64Schema,
// });
//
// type NotePayload = z.infer<typeof NotePayloadSchema>;
//
// export const notePayloadToProto = (n: NotePayload): NotePayloadProto =>
//   new NotePayloadProto({
//     encryptedNote: new NoteCiphertext({ inner: base64ToUint8Array(n.encryptedNote.inner) }),
//     ephemeralKey: base64ToUint8Array(n.ephemeralKey),
//     noteCommitment: new StateCommitment({ inner: base64ToUint8Array(n.noteCommitment.inner) }),
//   });
