import { z } from 'zod';
import { SpendSchema, spendToProto } from './spend';
import { OutputSchema, outputToProto } from './output';
import { Action as ActionProto } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

export const ActionSchema = z.union([
  z.object({ spend: SpendSchema }),
  z.object({ output: OutputSchema }),

  // TODO: Write remaining Zod types + proto conversions
  z.object({ swap: z.unknown() }),
  z.object({ swapClaim: z.unknown() }),
  z.object({ ics20Withdrawal: z.unknown() }),
  z.object({ validatorDefinition: z.unknown() }),
  z.object({ ibcAction: z.unknown() }),
  z.object({ proposalSubmit: z.unknown() }),
  z.object({ proposalWithdraw: z.unknown() }),
  z.object({ validatorVote: z.unknown() }),
  z.object({ delegatorVote: z.unknown() }),
  z.object({ proposalDepositClaim: z.unknown() }),
  z.object({ positionOpen: z.unknown() }),
  z.object({ positionClose: z.unknown() }),
  z.object({ positionWithdraw: z.unknown() }),
  z.object({ positionRewardClaim: z.unknown() }),
  z.object({ delegate: z.unknown() }),
  z.object({ undelegate: z.unknown() }),
  z.object({ undelegateClaim: z.unknown() }),
  z.object({ daoSpend: z.unknown() }),
  z.object({ daoOutput: z.unknown() }),
  z.object({ daoDeposit: z.unknown() }),
]);

type Action = z.infer<typeof ActionSchema>;

const actionToProto = (action: Action): ActionProto => {
  if ('spend' in action) {
    return spendToProto(action.spend);
  } else if ('output' in action) {
    return outputToProto(action.output);
  } else {
    console.error('Requires a type conversion for action');
    return new ActionProto({});
  }
};

export const actionsToProto = (actions: Action[]): ActionProto[] => actions.map(actionToProto);
