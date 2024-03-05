import { Action } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';

type ActionType = Exclude<Action['action']['case'], undefined>;
export interface ProvingKey {
  keyType: string;
  file: string;
}

export const provingKeysByActionType: Record<ActionType, ProvingKey | undefined> = {
  communityPoolDeposit: undefined,
  communityPoolOutput: undefined,
  communityPoolSpend: undefined,
  delegate: undefined,
  delegatorVote: { keyType: 'delegator_vote', file: 'delegator_vote_pk.bin' },
  ibcRelayAction: undefined,
  ics20Withdrawal: undefined,
  output: { keyType: 'output', file: 'output_pk.bin' },
  positionClose: undefined,
  positionOpen: undefined,
  positionRewardClaim: undefined,
  positionWithdraw: undefined,
  proposalDepositClaim: undefined,
  proposalSubmit: undefined,
  proposalWithdraw: undefined,
  spend: { keyType: 'spend', file: 'spend_pk.bin' },
  swap: { keyType: 'swap', file: 'swap_pk.bin' },
  swapClaim: { keyType: 'swap_claim', file: 'swapclaim_pk.bin' },
  undelegate: undefined,
  undelegateClaim: { keyType: 'convert', file: 'convert_pk.bin' },
  validatorDefinition: undefined,
  validatorVote: undefined,
};
