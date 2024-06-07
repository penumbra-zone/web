import type { Impl } from '.';
import { idbCtx } from '../ctx/prax';

export const notesForVoting: Impl['notesForVoting'] = async function* (req, ctx) {
  const idb = await ctx.values.get(idbCtx)();
  const votingNotes = await idb.getNotesForVoting(req.addressIndex, req.votableAtHeight);

  yield* votingNotes;
};
