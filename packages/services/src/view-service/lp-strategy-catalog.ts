import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';
import { LpStrategyCatalogResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

export const lpStrategyCatalog: Impl['lpStrategyCatalog'] = async function* (req, ctx) {
    const services = await ctx.values.get(servicesCtx)();
    const { indexedDb } = await services.getWalletServices();

    for await (const positionBundle of indexedDb.getPositionsByStrategyStream(req.subaccount!, req.positionMetadata!, undefined, req.tradingPair)) {
        console.log("positionBundle: ", positionBundle)
        
        yield new LpStrategyCatalogResponse(); 
    }

};
