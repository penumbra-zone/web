import {
  ActionLiquidityTournamentVoteView,
  ActionLiquidityTournamentVoteView_Opaque,
} from '@penumbra-zone/protobuf/penumbra/core/component/funding/v1/funding_pb';
import { Translator } from './types.js';

export const asOpaqueLiquidityTournamentVoteView: Translator<
  ActionLiquidityTournamentVoteView
> = liquidityTournamentVoteView => {
  return new ActionLiquidityTournamentVoteView({
    liquidityTournamentVote: {
      case: 'opaque',
      value: new ActionLiquidityTournamentVoteView_Opaque({
        vote: liquidityTournamentVoteView?.liquidityTournamentVote.value?.vote,
      }),
    },
  });
};
