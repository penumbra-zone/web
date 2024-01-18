import type { Impl } from '.';
import { assertWalletIdCtx, servicesCtx } from '../../ctx';

export const notesForVoting: Impl['notesForVoting'] = async function* (req, ctx) {
  const assertWalletId = ctx.values.get(assertWalletIdCtx);
  await assertWalletId(req.walletId);

  const services = ctx.values.get(servicesCtx);
  const { indexedDb } = await services.getWalletServices();
  const responses = await indexedDb.getNotesForVoting(req.addressIndex, req.votableAtHeight);

  yield* responses;
};
