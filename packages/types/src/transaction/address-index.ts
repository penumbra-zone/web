// export const AddressIndexSchema = z.object({
//   randomizer: Base64StringSchema,
//   account: z.number().optional(),
// });
//
// export const addressIndexToProto = (a: z.infer<typeof AddressIndexSchema>): AddressIndex => {
//   return new AddressIndex({
//     account: a.account ?? 0,
//     randomizer: base64ToUint8Array(a.randomizer),
//   });
// };
