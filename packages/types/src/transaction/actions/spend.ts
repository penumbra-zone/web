//
// export const SpendSchema = z.object({
//   authSig: InnerBase64Schema,
//   body: SpendBodySchema,
//   proof: InnerBase64Schema,
// });
//
// type Spend = z.infer<typeof SpendSchema>;
//
// export const spendActionToProto = (spend: Spend): Action =>
//   new Action({
//     action: {
//       case: 'spend',
//       value: {
//         body: spendBodyToProto(spend.body),
//         authSig: new SpendAuthSignature({ inner: base64ToUint8Array(spend.authSig.inner) }),
//         proof: new ZKSpendProof({ inner: base64ToUint8Array(spend.proof.inner) }),
//       },
//     },
//   });
