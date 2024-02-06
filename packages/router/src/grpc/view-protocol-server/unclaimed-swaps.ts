import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

export const unclaimedSwaps: Impl['unclaimedSwaps'] = async function* (_, ctx) {
  const services = ctx.values.get(servicesCtx);

  const { indexedDb } = await services.getWalletServices();

  for await (const swap of indexedDb.iterateSwaps()) {
    if (swap.heightClaimed !== 0n) continue;
    yield { swap };
  }
};
