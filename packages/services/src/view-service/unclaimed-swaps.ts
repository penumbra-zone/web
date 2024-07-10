import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';

export const unclaimedSwaps: Impl['unclaimedSwaps'] = async function* (_, ctx) {
  const services = await ctx.values.get(servicesCtx)();

  const { indexedDb } = await services.getWalletServices();

  for await (const swap of indexedDb.iterateSwaps()) {
    if (swap.heightClaimed !== 0n) {
      continue;
    }
    yield { swap };
  }
};
