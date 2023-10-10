//
// export const BodySchema = z.object({
//   actions: z.array(ActionSchema),
//   detectionData: z.object({
//     fmdClues: z.array(InnerBase64Schema),
//   }),
//   fee: z.object({
//     amount: z.object({}),
//   }),
//   memoData: z.object({
//     encryptedMemo: Base64StringSchema,
//   }),
//   transactionParameters: z.object({
//     chainId: z.string(),
//   }),
// });
//
// type TxBody = z.infer<typeof BodySchema>;
//
// export const txBodyToProto = (body: TxBody): TransactionBody => {
//   return new TransactionBody({
//     actions: actionsToProto(body.actions),
//     transactionParameters: body.transactionParameters,
//     fee: body.fee,
//     detectionData: new DetectionData({
//       fmdClues: body.detectionData.fmdClues.map(
//         c => new Clue({ inner: base64ToUint8Array(c.inner) }),
//       ),
//     }),
//     memoData: new MemoData({
//       encryptedMemo: base64ToUint8Array(body.memoData.encryptedMemo),
//     }),
//   });
// };
