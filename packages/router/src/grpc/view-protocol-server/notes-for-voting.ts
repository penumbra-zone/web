import type { Impl } from '.';
import { assertWalletIdCtx, servicesCtx } from '../../ctx';

export const notesForVoting: Impl['notesForVoting'] = async function* (req, ctx) {
  const assertWalletId = ctx.values.get(assertWalletIdCtx);
  await assertWalletId(req.walletId);

  const services = ctx.values.get(servicesCtx);
  const { indexedDb } = await services.getWalletServices();
  const allNotes = await indexedDb.getAllNotes();

  let responses = allNotes.map(notes => ({
    noteRecord: notes,
  }));

  yield* responses;
};
