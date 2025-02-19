import { UnknownAction } from './unknown';
import { ActionLiquidityTournamentVote } from '@penumbra-zone/protobuf/penumbra/core/component/funding/v1/funding_pb';

export interface LiquidityTournamentVoteActionProps {
  value: ActionLiquidityTournamentVote;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- unimplemented
export const LiquidityTournamentVoteAction = (_: LiquidityTournamentVoteActionProps) => {
  return <UnknownAction label='Liquidity Tournament Vote' opaque={false} />;
};
