import type { Action } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';

export type ActionType = Exclude<Action['action']['case'], undefined>;

export const provingKeys: Partial<Record<ActionType, string>> = {
  delegatorVote: 'delegator_vote',
  output: 'output',
  spend: 'spend',
  swap: 'swap',
  swapClaim: 'swapclaim',
  undelegateClaim: 'convert',
};
