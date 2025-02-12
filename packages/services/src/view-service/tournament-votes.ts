import type { Impl } from './index.js';
import { TournamentVotesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { servicesCtx } from '../ctx/prax.js';

export const tournamentVotes: Impl['tournamentVotes'] = async (req, ctx) => {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();

  // Get the starting block height for the corresponding epoch index.
  let epoch = await indexedDb.getBlockHeightByEpoch(req.epochIndex);

  // Retrieve list of all transactions.
  const votingNotes = indexedDb.iterateTransactions();

  // TODO: For each transaction, verify if its height falls within the current epoch range,
  // and return the votes for the liquidity tournament.
  for await (const transaction of votingNotes) {
    if (transaction.height > epoch?.startHeight!) {
    }
  }

  // Stub `TournamentVotesResponse`
  return new TournamentVotesResponse();
};
