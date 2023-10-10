// export const SpendBodySchema = z.object({
//   balanceCommitment: InnerBase64Schema,
//   nullifier: Base64StringSchema,
//   rk: Base64StringSchema,
// });
//
// export const spendBodyToProto = (sb: z.infer<typeof SpendBodySchema>): SpendBody => {
//   return new SpendBody({
//     balanceCommitment: new BalanceCommitment({
//       inner: base64ToUint8Array(sb.balanceCommitment.inner),
//     }),
//     nullifier: base64ToUint8Array(sb.nullifier),
//     rk: base64ToUint8Array(sb.rk),
//   });
// };
