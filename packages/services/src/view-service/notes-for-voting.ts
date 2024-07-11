import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';

export const notesForVoting: Impl['notesForVoting'] = async function* (req, ctx) {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();
  const votingNotes = await indexedDb.getNotesForVoting(req.addressIndex, req.votableAtHeight);

  yield* votingNotes;
};
