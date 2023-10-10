// export const AmountSchema = z.object({
//   lo: z.string().optional(),
//   hi: z.string().optional(),
// });
//
// export const amountToProto = (a: z.infer<typeof AmountSchema>): Amount => {
//   return new Amount({
//     lo: a.lo ? BigInt(a.lo) : 0n,
//     hi: a.hi ? BigInt(a.hi) : 0n,
//   });
// };
