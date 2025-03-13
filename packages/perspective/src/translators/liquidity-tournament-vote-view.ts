import {
  ActionLiquidityTournamentVoteViewSchema,
  ActionLiquidityTournamentVoteView_OpaqueSchema,
} from '@penumbra-zone/protobuf/penumbra/core/component/funding/v1/funding_pb';

import { create } from '@bufbuild/protobuf';

import type { ActionLiquidityTournamentVoteView } from '@penumbra-zone/protobuf/penumbra/core/component/funding/v1/funding_pb';

import { Translator } from './types.js';

export const asOpaqueLiquidityTournamentVoteView: Translator<
  ActionLiquidityTournamentVoteView
> = liquidityTournamentVoteView => {
  return create(ActionLiquidityTournamentVoteViewSchema, {
    liquidityTournamentVote: {
      case: 'opaque',
      value: create(ActionLiquidityTournamentVoteView_OpaqueSchema, {
        vote: liquidityTournamentVoteView?.liquidityTournamentVote.value?.vote,
      }),
    },
  });
};
