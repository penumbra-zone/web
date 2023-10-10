//
// const SpendSchema = z.object({
//   authSig: InnerBase64Schema,
//   proof: InnerBase64Schema,
//   body: SpendBodySchema,
// });
//
// const spendSchemaToProto = (s: z.infer<typeof SpendSchema>): Spend => {
//   return new Spend({
//     body: spendBodyToProto(s.body),
//     authSig: { inner: base64ToUint8Array(s.authSig.inner) },
//     proof: { inner: base64ToUint8Array(s.proof.inner) },
//   });
// };
//
// export const VisibleAddressSchema = z.object({
//   visible: z.object({
//     accountGroupId: InnerBase64Schema,
//     address: InnerBase64Schema,
//     index: AddressIndexSchema,
//   }),
// });
//
// export const OpaqueAddressSchema = z.object({
//   opaque: z.object({
//     accountGroupId: InnerBase64Schema,
//     address: InnerBase64Schema,
//     index: AddressIndexSchema,
//   }),
// });
//
// const UnknownDenomSchema = z.object({
//   unknownDenom: z.object({
//     amount: AmountSchema,
//     assetId: InnerBase64Schema,
//   }),
// });
//
// const KnownDenomSchema = z.object({
//   knownDenom: z.object({
//     amount: AmountSchema,
//     denomMetadata: DenomMetadataSchema,
//   }),
// });
//
// const valueToProto = (value: z.infer<typeof DenomValueSchema>): ValueView => {
//   if ('unknownDenom' in value) {
//     return new ValueView({
//       valueView: {
//         case: 'unknownDenom',
//         value: new ValueView_UnknownDenom({
//           amount: amountToProto(value.unknownDenom.amount),
//           assetId: new AssetId({ inner: base64ToUint8Array(value.unknownDenom.assetId.inner) }),
//         }),
//       },
//     });
//   } else {
//     return new ValueView({
//       valueView: {
//         case: 'knownDenom',
//         value: new ValueView_KnownDenom({
//           amount: amountToProto(value.knownDenom.amount),
//           denom: denomToProto(value.knownDenom.denomMetadata),
//         }),
//       },
//     });
//   }
// };
//
// const DenomValueSchema = UnknownDenomSchema.or(KnownDenomSchema);
//
// const AddressNoteSchema = VisibleAddressSchema.or(OpaqueAddressSchema);
//
// export const SpendNoteSchema = z.object({
//   value: DenomValueSchema,
//   rseed: Base64StringSchema,
//   address: AddressNoteSchema,
// });
//
// const addressNoteToProto = (a: z.infer<typeof AddressNoteSchema>): AddressView => {
//   if ('visible' in a) {
//     return new AddressView({
//       addressView: {
//         case: 'visible',
//         value: new AddressView_Visible({
//           address: { inner: base64ToUint8Array(a.visible.address.inner) },
//
//           index: addressIndexToProto(a.visible.index),
//           accountGroupId: { inner: base64ToUint8Array(a.visible.accountGroupId.inner) },
//         }),
//       },
//     });
//   } else if ('opaque' in a) {
//     return new AddressView({
//       addressView: {
//         case: 'opaque',
//         value: new AddressView_Opaque({
//           address: { inner: base64ToUint8Array(a.opaque.address.inner) },
//         }),
//       },
//     });
//   } else {
//     return new AddressView({
//       addressView: { case: undefined, value: undefined },
//     });
//   }
// };
//
// export const spendNoteToProto = (s: z.infer<typeof SpendNoteSchema>): NoteView => {
//   return new NoteView({
//     value: valueToProto(s.value),
//     rseed: base64ToUint8Array(s.rseed),
//     address: addressNoteToProto(s.address),
//   });
// };
//
// const OpaqueSpendView = z.object({
//   opaque: z.object({
//     note: SpendNoteSchema,
//     spend: SpendSchema,
//   }),
// });
//
// const opaqueViewToProto = (o: z.infer<typeof OpaqueSpendView>): ActionView => {
//   return new ActionView({
//     actionView: {
//       case: 'spend',
//       value: new SpendView({
//         spendView: {
//           case: 'opaque',
//           value: new SpendView_Opaque({
//             spend: spendSchemaToProto(o.opaque.spend),
//           }),
//         },
//       }),
//     },
//   });
// };
//
// const VisibleSpendView = z.object({
//   visible: z.object({
//     note: SpendNoteSchema,
//     spend: SpendSchema,
//   }),
// });
//
// const visibleViewToProto = (v: z.infer<typeof VisibleSpendView>): ActionView => {
//   return new ActionView({
//     actionView: {
//       case: 'spend',
//       value: new SpendView({
//         spendView: {
//           case: 'visible',
//           value: new SpendView_Visible({
//             spend: spendSchemaToProto(v.visible.spend),
//             note: spendNoteToProto(v.visible.note),
//           }),
//         },
//       }),
//     },
//   });
// };
//
// export const SpendViewSchema = VisibleSpendView.or(OpaqueSpendView);
//
// export const spendViewToProto = (sv: z.infer<typeof SpendViewSchema>): ActionView => {
//   if ('visible' in sv) {
//     return visibleViewToProto(sv);
//   } else if ('opaque' in sv) {
//     return opaqueViewToProto(sv);
//   } else {
//     console.error('Requires a type conversion for ActionView');
//     return new ActionView({});
//   }
// };
