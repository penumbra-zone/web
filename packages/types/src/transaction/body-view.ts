//
// const VisibleMemoSchema = z.object({
//   visible: z.object({
//     ciphertext: InnerBase64Schema,
//     plaintext: z.object({
//       sender: InnerBase64Schema,
//     }),
//   }),
// });
//
// const visibleToProto = (vm: z.infer<typeof VisibleMemoSchema>): MemoView => {
//   return new MemoView({
//     memoView: {
//       case: 'visible',
//       value: new MemoView_Visible({
//         ciphertext: { inner: base64ToUint8Array(vm.visible.ciphertext.inner) },
//         plaintext: {
//           sender: new Address({
//             inner: base64ToUint8Array(vm.visible.plaintext.sender.inner),
//           }),
//         },
//       }),
//     },
//   });
// };
//
// const OpaqueMemoSchema = z.object({
//   opaque: z.object({
//     ciphertext: InnerBase64Schema,
//   }),
// });
//
// const opaqueToProto = (om: z.infer<typeof OpaqueMemoSchema>): MemoView => {
//   return new MemoView({
//     memoView: {
//       case: 'opaque',
//       value: new MemoView_Opaque({
//         ciphertext: { inner: base64ToUint8Array(om.opaque.ciphertext.inner) },
//       }),
//     },
//   });
// };
//
// const MemoViewSchema = VisibleMemoSchema.or(OpaqueMemoSchema);
//
// const memoToProto = (mv: z.infer<typeof MemoViewSchema>): MemoView => {
//   if ('visible' in mv) {
//     return visibleToProto(mv);
//   } else if ('opaque' in mv) {
//     return opaqueToProto(mv);
//   } else {
//     return new MemoView({
//       memoView: {
//         case: undefined,
//         value: undefined,
//       },
//     });
//   }
// };
//
// export const BodyViewSchema = z.object({
//   actionViews: ActionViewsSchema,
//   detectionData: z.object({
//     fmdClues: z.array(InnerBase64Schema),
//   }),
//   fee: z.object({
//     amount: AmountSchema,
//     assetId: InnerBase64Schema.optional(),
//   }),
//   memoView: MemoViewSchema,
//   transactionParameters: z.object({
//     chainId: z.string(),
//   }),
// });
//
// export const bodyViewToProto = (bv: z.infer<typeof BodyViewSchema>): TransactionBodyView => {
//   return new TransactionBodyView({
//     actionViews: actionViewsToProto(bv.actionViews),
//     transactionParameters: new TransactionParameters({
//       chainId: bv.transactionParameters.chainId,
//     }),
//     fee: new Fee({
//       amount: amountToProto(bv.fee.amount),
//       assetId: bv.fee.assetId?.inner
//         ? { inner: base64ToUint8Array(bv.fee.assetId.inner) }
//         : new AssetId(),
//     }),
//     detectionData: new DetectionData({
//       fmdClues: bv.detectionData.fmdClues.map(
//         c => new Clue({ inner: base64ToUint8Array(c.inner) }),
//       ),
//     }),
//     memoView: memoToProto(bv.memoView),
//   });
// };
