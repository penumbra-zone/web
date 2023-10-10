// export const NoteValueSchema = z.object({
//   amount: AmountSchema,
//   assetId: InnerBase64Schema,
// });
//
// export const NoteSchema = z.object({
//   value: NoteValueSchema,
//   rseed: Base64StringSchema,
//   address: InnerBase64Schema,
// });
//
// const noteValToProto = (v: z.infer<typeof NoteValueSchema>): Value => {
//   return new Value({
//     amount: amountToProto(v.amount),
//     assetId: new AssetId({ inner: base64ToUint8Array(v.assetId.inner) }),
//   });
// };
//
// export const noteToProto = (n: z.infer<typeof NoteSchema>): Note => {
//   return new Note({
//     value: noteValToProto(n.value),
//     rseed: base64ToUint8Array(n.rseed),
//     address: { inner: base64ToUint8Array(n.address.inner) },
//   });
// };
//
// export const notesToProto = (notes: z.infer<typeof NoteSchema>[]): Note[] => notes.map(noteToProto);
