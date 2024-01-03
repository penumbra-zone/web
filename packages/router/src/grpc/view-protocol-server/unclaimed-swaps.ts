import type { Impl } from '.';
import { servicesCtx, assertWalletIdCtx } from '../../ctx';

export const unclaimedSwaps: Impl['unclaimedSwaps'] = async function* (req, ctx) {
  const services = ctx.values.get(servicesCtx);
  const assertWalletId = ctx.values.get(assertWalletIdCtx);
  await assertWalletId(req.walletId);

  const { indexedDb } = await services.getWalletServices();
  const allSwaps = await indexedDb.getAllSwaps();

  const responses = allSwaps.filter(swap => swap.heightClaimed === 0n).map(swap => ({ swap }));
  yield* responses;
};
