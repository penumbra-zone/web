// const OutputBodySchema = z.object({
//   balanceCommitment: InnerBase64Schema,
//   notePayload: NotePayloadSchema,
//   ovkWrappedKey: Base64StringSchema,
//   wrappedMemoKey: Base64StringSchema,
// });
//
// const OutputSchema = z.object({
//   body: OutputBodySchema,
//   proof: InnerBase64Schema,
// });
//
// const OpaqueOutputViewSchema = z.object({
//   visible: z.object({
//     note: SpendNoteSchema,
//     payloadKey: InnerBase64Schema,
//     output: OutputSchema,
//   }),
// });
//
// const opaqueViewToProto = (v: z.infer<typeof OpaqueOutputViewSchema>): ActionView => {
//   return new ActionView({
//     actionView: {
//       case: 'output',
//       value: new OutputView({
//         outputView: {
//           case: 'opaque',
//           value: new OutputView_Opaque({
//             output: outputToProto(v.visible.output),
//           }),
//         },
//       }),
//     },
//   });
// };
//
// const VisibleOutputViewSchema = z.object({
//   visible: z.object({
//     note: SpendNoteSchema,
//     payloadKey: InnerBase64Schema,
//     output: z.object({
//       body: OutputBodySchema,
//       proof: InnerBase64Schema,
//     }),
//   }),
// });
//
// const visibleViewToProto = (v: z.infer<typeof VisibleOutputViewSchema>): ActionView => {
//   return new ActionView({
//     actionView: {
//       case: 'output',
//       value: new OutputView({
//         outputView: {
//           case: 'visible',
//           value: new OutputView_Visible({
//             output: outputToProto(v.visible.output),
//             note: spendNoteToProto(v.visible.note),
//             payloadKey: { inner: base64ToUint8Array(v.visible.payloadKey.inner) },
//           }),
//         },
//       }),
//     },
//   });
// };
//
// export const OutputViewSchema = VisibleOutputViewSchema.or(OpaqueOutputViewSchema);
//
// export const outputViewToProto = (ov: z.infer<typeof OutputViewSchema>): ActionView => {
//   if ('visible' in ov) {
//     return visibleViewToProto(ov);
//   } else if ('opaque' in ov) {
//     return opaqueViewToProto(ov);
//   } else {
//     console.error('Requires a type conversion for ActionView');
//     return new ActionView({});
//   }
// };
