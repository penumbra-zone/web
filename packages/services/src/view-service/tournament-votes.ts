import type { Impl } from './index.js';
import { TournamentVotesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

export const tournamentVotes: Impl['tournamentVotes'] = async (_req, _ctx) => {
  // todo: this will make use of our new LQT tables.

  // Return a stub `TournamentVotesResponse`
  return new TournamentVotesResponse();
};
