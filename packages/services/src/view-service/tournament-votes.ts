import type { Impl } from './index.js';
import { create } from '@bufbuild/protobuf';
import {
  TournamentVotesResponseSchema,
  TournamentVotesResponse_VoteSchema,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { servicesCtx } from '../ctx/prax.js';
import { AmountSchema } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { ValueSchema } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export const tournamentVotes: Impl['tournamentVotes'] = async (req, ctx) => {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();

  // Get the starting block height for the corresponding epoch index.
  const epoch = await indexedDb.getBlockHeightByEpoch(req.epochIndex);

  // Retrieve the vote cast in the liquidity tournament for the current epoch.
  const tournamentVote = create(TournamentVotesResponseSchema);
  if (epoch?.index) {
    const votes = await indexedDb.getLQTHistoricalVotes(epoch.index);

    if (votes.length > 0) {
      tournamentVote.votes = votes.map(vote =>
        create(TournamentVotesResponse_VoteSchema, {
          transaction: vote.TransactionId,
          incentivizedAsset: vote.AssetMetadata.penumbraAssetId,
          votePower: vote.VoteValue.amount,
          reward: vote.RewardValue
            ? create(ValueSchema, {
                amount: create(AmountSchema, { lo: vote.RewardValue.lo, hi: vote.RewardValue.hi }),
                assetId: indexedDb.stakingTokenAssetId,
              })
            : undefined,
        }),
      );
    }
  }

  return tournamentVote;
};
