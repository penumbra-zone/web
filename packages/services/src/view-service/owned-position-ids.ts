import type { Impl } from '.';

import { dbCtx } from '../ctx/database';

export const ownedPositionIds: Impl['ownedPositionIds'] = async function* (req, ctx) {
  const indexedDb = await ctx.values.get(dbCtx)();

  for await (const positionId of indexedDb.getOwnedPositionIds(
    req.positionState,
    req.tradingPair,
  )) {
    yield { positionId: positionId };
  }
};
