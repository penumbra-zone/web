// const ActionViewSchema = z.union([
//   z.object({ spend: SpendViewSchema }),
//   z.object({ output: OutputViewSchema }),
//
//   // TODO: Write remaining Zod types + proto conversions
//   z.object({ swap: z.unknown() }),
//   z.object({ swapClaim: z.unknown() }),
//   z.object({ validatorDefinition: z.unknown() }),
//   z.object({ ibcAction: z.unknown() }),
//   z.object({ proposalSubmit: z.unknown() }),
//   z.object({ proposalWithdraw: z.unknown() }),
//   z.object({ validatorVote: z.unknown() }),
//   z.object({ delegatorVote: z.unknown() }),
//   z.object({ proposalDepositClaim: z.unknown() }),
//   z.object({ positionOpen: z.unknown() }),
//   z.object({ positionClose: z.unknown() }),
//   z.object({ positionWithdraw: z.unknown() }),
//   z.object({ positionRewardClaim: z.unknown() }),
//   z.object({ delegate: z.unknown() }),
//   z.object({ undelegate: z.unknown() }),
//   z.object({ daoSpend: z.unknown() }),
//   z.object({ daoOutput: z.unknown() }),
//   z.object({ daoDeposit: z.unknown() }),
//   z.object({ undelegateClaim: z.unknown() }),
//   z.object({ ics20Withdrawal: z.unknown() }),
//   z.object({ swap: z.unknown() }),
// ]);
// export const ActionViewsSchema = z.array(ActionViewSchema);
//
// export const actionViewsToProto = (
//   actionViews: z.infer<typeof ActionViewsSchema>,
// ): ActionView[] => {
//   return actionViews.map(av => {
//     if ('spend' in av) {
//       return spendViewToProto(av.spend);
//     } else if ('output' in av) {
//       return outputViewToProto(av.output);
//     } else {
//       console.error('Requires a type conversion for action');
//       return new ActionView();
//     }
//   });
// };
