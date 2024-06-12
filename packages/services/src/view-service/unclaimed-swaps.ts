import type { Impl } from '.';

import { dbCtx } from '../ctx/database';

export const unclaimedSwaps: Impl['unclaimedSwaps'] = async function* (_, ctx) {
  const indexedDb = await ctx.values.get(dbCtx)();

  for await (const swap of indexedDb.iterateSwaps()) {
    if (swap.heightClaimed !== 0n) continue;
    yield { swap };
  }
};
