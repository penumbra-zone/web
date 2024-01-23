import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

export const unclaimedSwaps: Impl['unclaimedSwaps'] = async function* (_, ctx) {
  const services = ctx.values.get(servicesCtx);

  const { indexedDb } = await services.getWalletServices();
  const allSwaps = await indexedDb.getAllSwaps();

  const responses = allSwaps.filter(swap => swap.heightClaimed === 0n).map(swap => ({ swap }));
  yield* responses;
};
