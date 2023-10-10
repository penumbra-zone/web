//
// export const OutputSchema = z.object({
//   body: z.object({
//     balanceCommitment: InnerBase64Schema,
//     notePayload: NotePayloadSchema,
//     ovkWrappedKey: Base64StringSchema,
//     wrappedMemoKey: Base64StringSchema,
//   }),
//   proof: InnerBase64Schema,
// });
//
// export const outputToProto = (o: z.infer<typeof OutputSchema>): Output => {
//   return new Output({
//     body: new OutputBody({
//       balanceCommitment: new BalanceCommitment({
//         inner: base64ToUint8Array(o.body.balanceCommitment.inner),
//       }),
//       notePayload: notePayloadToProto(o.body.notePayload),
//       ovkWrappedKey: base64ToUint8Array(o.body.ovkWrappedKey),
//       wrappedMemoKey: base64ToUint8Array(o.body.wrappedMemoKey),
//     }),
//     proof: new ZKOutputProof({ inner: base64ToUint8Array(o.proof.inner) }),
//   });
// };
