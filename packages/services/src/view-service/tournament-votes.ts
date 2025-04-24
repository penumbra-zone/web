import type { Impl } from './index.js';
import {
  TournamentVotesResponse,
  TournamentVotesResponse_Vote,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { servicesCtx } from '../ctx/prax.js';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export const tournamentVotes: Impl['tournamentVotes'] = async function* (req, ctx) {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();

  // Retrieve the vote cast in the liquidity tournament for the current epoch.
  if (req.epochIndex) {
    let tournamentVote = new TournamentVotesResponse() ?? undefined;

    const votes = await indexedDb.getLQTHistoricalVotesByEpoch(req.epochIndex);
    console.log('votes inside tournamentVotes: ', votes);

    if (votes.length > 0) {
      tournamentVote.votes = votes.map(
        vote =>
          new TournamentVotesResponse_Vote({
            transaction: vote.TransactionId,
            incentivizedAsset: vote.AssetMetadata.penumbraAssetId,
            votePower: vote.VoteValue.amount,
            reward: vote.RewardValue
              ? new Value({
                  amount: new Amount({ lo: vote.RewardValue.lo, hi: vote.RewardValue.hi }),
                  assetId: vote.VoteValue.assetId,
                })
              : undefined,
            epochIndex: BigInt(vote.epoch),
          }),
      );
    }

    yield tournamentVote;
  }

  // Retrieve votes cast in the liquidity tournament up to specified block height's starting epoch.
  if (req.blockHeight) {
    // todo: SCT query over indexedDB query instead
    const epoch = await indexedDb.getEpochByHeight(req.blockHeight);

    let currentEpoch: string | undefined;
    let bucket: TournamentVotesResponse_Vote[] = [];

    // logical groupings note
    for await (const vote of indexedDb.getVotesThroughEpochInclusive(epoch!.index)) {
      const epochKey = vote.epoch;

      if (currentEpoch === undefined) {
        currentEpoch = epochKey;
      } else if (epochKey !== currentEpoch) {
        // flush the previous epoch before switching
        yield new TournamentVotesResponse({
          votes: bucket,
        });
        bucket = [];
        currentEpoch = epochKey;
      }

      // accumulate vote inside current epoch’s bucket
      bucket.push(
        new TournamentVotesResponse_Vote({
          transaction: vote.TransactionId,
          incentivizedAsset: vote.AssetMetadata.penumbraAssetId,
          votePower: vote.VoteValue.amount,
          reward: vote.RewardValue
            ? new Value({
                amount: new Amount({
                  lo: vote.RewardValue.lo,
                  hi: vote.RewardValue.hi,
                }),
                assetId: vote.VoteValue.assetId,
              })
            : undefined,
          epochIndex: BigInt(vote.epoch),
        }),
      );
    }

    if (bucket.length) {
      yield new TournamentVotesResponse({
        votes: bucket,
      });
    }
  }
};
