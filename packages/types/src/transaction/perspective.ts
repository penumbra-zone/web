//
// const SpendNullifierSchema = z.object({
//   note: NoteSchema,
//   nullifier: InnerBase64Schema,
// });
//
// const spendNullifiersToProto = (
//   all: z.infer<typeof SpendNullifierSchema>[],
// ): NullifierWithNote[] => {
//   return all.map(
//     s =>
//       new NullifierWithNote({
//         nullifier: { inner: base64ToUint8Array(s.nullifier.inner) },
//         note: noteToProto(s.note),
//       }),
//   );
// };
//
// const OpaqueSchema = z.object({
//   opaque: z.object({
//     address: InnerBase64Schema,
//   }),
// });
//
// const opaqueToProto = (o: z.infer<typeof OpaqueSchema>): AddressView => {
//   return new AddressView({
//     addressView: {
//       case: 'opaque',
//       value: new AddressView_Opaque({
//         address: new Address({
//           inner: base64ToUint8Array(o.opaque.address.inner),
//         }),
//       }),
//     },
//   });
// };
//
// const PayloadKeySchema = z.object({
//   commitment: InnerBase64Schema,
//   payloadKey: InnerBase64Schema,
// });
//
// const payloadKeysToProto = (
//   pKeys: z.infer<typeof PayloadKeySchema>[],
// ): PayloadKeyWithCommitment[] => {
//   return pKeys.map(
//     p =>
//       new PayloadKeyWithCommitment({
//         payloadKey: { inner: base64ToUint8Array(p.payloadKey.inner) },
//         commitment: { inner: base64ToUint8Array(p.commitment.inner) },
//       }),
//   );
// };
//
// const VisibleSchema = z.object({
//   visible: z.object({
//     accountGroupId: InnerBase64Schema,
//     address: InnerBase64Schema,
//     index: AddressIndexSchema,
//   }),
// });
//
// const visibleToProto = (v: z.infer<typeof VisibleSchema>): AddressView => {
//   return new AddressView({
//     addressView: {
//       case: 'visible',
//       value: new AddressView_Visible({
//         address: { inner: base64ToUint8Array(v.visible.address.inner) },
//         index: addressIndexToProto(v.visible.index),
//         accountGroupId: { inner: base64ToUint8Array(v.visible.accountGroupId.inner) },
//       }),
//     },
//   });
// };
//
// const AddressViewSchema = z.array(VisibleSchema.or(OpaqueSchema));
//
// const addressViewsToProto = (addressViews: z.infer<typeof AddressViewSchema>): AddressView[] => {
//   return addressViews.map(av => {
//     if ('visible' in av) {
//       return visibleToProto(av);
//     } else if ('opaque' in av) {
//       return opaqueToProto(av);
//     } else {
//       return new AddressView({
//         addressView: { case: undefined, value: undefined },
//       });
//     }
//   });
// };
//
// export const TxpSchema = z.object({
//   addressViews: AddressViewSchema,
//   payloadKeys: z.array(PayloadKeySchema),
//   spendNullifiers: z.array(SpendNullifierSchema),
//   transactionId: z.object({
//     hash: Base64StringSchema,
//   }),
//   adviceNotes: z.array(NoteSchema).optional(),
//   denoms: z.array(DenomMetadataSchema).optional(),
// });
//
// export type TransactionPerspective = z.infer<typeof TxpSchema>;
//
// export const perspectiveToProto = (p: TransactionPerspective): TxpProto =>
//   new TxpProto({
//     payloadKeys: payloadKeysToProto(p.payloadKeys),
//     spendNullifiers: spendNullifiersToProto(p.spendNullifiers),
//     adviceNotes: p.adviceNotes ? notesToProto(p.adviceNotes) : [],
//     addressViews: addressViewsToProto(p.addressViews),
//     denoms: p.denoms ? denomsToProto(p.denoms) : [],
//     transactionId: { hash: base64ToUint8Array(p.transactionId.hash) },
//   });
