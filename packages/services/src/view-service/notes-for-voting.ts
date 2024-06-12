import type { Impl } from '.';

import { dbCtx } from '../ctx/database';

export const notesForVoting: Impl['notesForVoting'] = async function* (req, ctx) {
  const indexedDb = await ctx.values.get(dbCtx)();
  const votingNotes = await indexedDb.getNotesForVoting(req.addressIndex, req.votableAtHeight);

  yield* votingNotes;
};
