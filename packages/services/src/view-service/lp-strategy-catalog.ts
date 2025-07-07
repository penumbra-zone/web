import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';
import {
  LpStrategyCatalogResponse,
  LpStrategyCatalogResponse_StrategyEntry,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { TradingPair } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';

export const lpStrategyCatalog: Impl['lpStrategyCatalog'] = async function* (req, ctx) {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();

  if (!req.subaccount || !req.positionMetadata) {
    throw new Error('Missing required fields: subaccount or positionMetadata');
  }

  const strategies: LpStrategyCatalogResponse_StrategyEntry[] | undefined = [];
  for await (const positionBundle of indexedDb.getPositionsByStrategyStream(
    req.subaccount,
    req.positionMetadata,
    undefined,
    req.tradingPair,
  )) {
    const entry = new LpStrategyCatalogResponse_StrategyEntry({
      // Placeholder: trading pair to be filled in by the caller using a full node query.
      //  * Step 1: Query prax to retrieve position IDs.
      //  * Step 2: Use those position IDs to fetch position details from the full node.
      tradingPair: new TradingPair({}),
      subaccount: req.subaccount,
      positionMetadata: positionBundle.positionMetadata,
    });

    strategies.push(entry);
  }

  yield new LpStrategyCatalogResponse({ strategies });
};
