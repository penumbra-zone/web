import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';
import {
  LpStrategyCatalogResponse,
  LpStrategyCatalogResponse_StrategyEntry,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

export const lpStrategyCatalog: Impl['lpStrategyCatalog'] = async function* (req, ctx) {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();

  const strategies: LpStrategyCatalogResponse_StrategyEntry[] | undefined = [];
  for await (const lpStrategyCatalog of indexedDb.getPositionsByStrategyStream(
    req.subaccount,
    req.positionMetadata,
    undefined,
    req.tradingPair,
  )) {
    const entry = new LpStrategyCatalogResponse_StrategyEntry({
      tradingPair: lpStrategyCatalog.position.phi?.pair,
      subaccount: lpStrategyCatalog.subaccount,
      positionMetadata: lpStrategyCatalog.positionMetadata,
    });

    strategies.push(entry);
  }

  yield new LpStrategyCatalogResponse({ strategies });
};
