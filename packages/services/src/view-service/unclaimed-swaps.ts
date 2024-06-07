import type { Impl } from '.';
import { idbCtx } from '../ctx/prax';

export const unclaimedSwaps: Impl['unclaimedSwaps'] = async function* (_, ctx) {
  const idb = await ctx.values.get(idbCtx)();

  for await (const swap of idb.iterateSwaps()) {
    if (swap.heightClaimed !== 0n) continue;
    yield { swap };
  }
};
