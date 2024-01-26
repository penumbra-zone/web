import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

export const ownedPositionIds: Impl['ownedPositionIds'] = async function* (req, ctx) {
  const services = ctx.values.get(servicesCtx);

  const { indexedDb } = await services.getWalletServices();

  const positionIds = indexedDb.getOwnedPositionIds(req.positionState, req.tradingPair);
  for await (const positionId of positionIds) {
    yield { positionId };
  }
};
