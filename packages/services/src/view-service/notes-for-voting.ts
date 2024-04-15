import type { Impl } from '.';
import { servicesCtx } from '../ctx/prax';

export const notesForVoting: Impl['notesForVoting'] = async function* (req, ctx) {
  const services = ctx.values.get(servicesCtx);
  const { indexedDb } = await services.getWalletServices();
  const votingNotes = await indexedDb.getNotesForVoting(req.addressIndex, req.votableAtHeight);

  yield* votingNotes;
};
