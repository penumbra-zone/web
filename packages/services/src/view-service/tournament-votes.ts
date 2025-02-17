import type { Impl } from './index.js';
import {
  TournamentVotesResponse,
  TournamentVotesResponse_Vote,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { servicesCtx } from '../ctx/prax.js';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export const tournamentVotes: Impl['tournamentVotes'] = async (req, ctx) => {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();

  // Get the starting block height for the corresponding epoch index.
  const epoch = await indexedDb.getBlockHeightByEpoch(req.epochIndex);

  // Retrieve the vote cast in the liquidity tournament for the current epoch.
  const tournamentVote = new TournamentVotesResponse();
  if (epoch?.index) {
    const vote = await indexedDb.getLQTHistoricalVote(epoch.index);
    if (vote) {
      tournamentVote.votes.push(
        new TournamentVotesResponse_Vote({
          transaction: vote.TransactionId,
          incentivizedAsset: vote.AssetMetadata.penumbraAssetId,
          votePower: vote.VoteValue.amount,
          reward: vote.RewardValue
            ? new Value({
                amount: new Amount({ lo: vote.RewardValue.lo, hi: vote.RewardValue.hi }),
                assetId: indexedDb.stakingTokenAssetId,
              })
            : undefined,
        }),
      );
    }
  }

  return tournamentVote;
};
