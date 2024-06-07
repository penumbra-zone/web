import type { Impl } from '.';
import { idbCtx } from '../ctx/prax';

export const ownedPositionIds: Impl['ownedPositionIds'] = async function* (req, ctx) {
  const idb = await ctx.values.get(idbCtx)();

  for await (const positionId of idb.getOwnedPositionIds(req.positionState, req.tradingPair)) {
    yield { positionId: positionId };
  }
};
