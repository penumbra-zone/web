import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';

export const ownedPositionIds: Impl['ownedPositionIds'] = async function* (req, ctx) {
  const services = await ctx.values.get(servicesCtx)();

  const { indexedDb } = await services.getWalletServices();

  for await (const positionId of indexedDb.getOwnedPositionIds(
    req.positionState,
    req.tradingPair,
  )) {
    yield { positionId: positionId };
  }
};
