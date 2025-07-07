import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';
import { LpPositionBundleResponse, LpPositionBundleResponse_Entry } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { TradingPair } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';

export const lpPositionBundle: Impl['lpPositionBundle'] = async function* (req, ctx) {
    const services = await ctx.values.get(servicesCtx)();
    const { indexedDb } = await services.getWalletServices();

    let entries: LpPositionBundleResponse_Entry[] | undefined = [];
    for await (const positionBundle of indexedDb.getPositionsByStrategyStream(req.subaccount!, req.positionMetadata!, req.positionState, req.tradingPair)) {        
        let entry = new LpPositionBundleResponse_Entry({
            // Placeholder: trading pair to be filled in by the caller using a full node query.
            //  * Step 1: Query prax to retrieve position IDs.
            //  * Step 2: Use those position IDs to fetch position details from the full node.
            tradingPair: new TradingPair({}),
            subaccount: req.subaccount,
            positionMetadata: positionBundle.positionMetadata,
            positionState: positionBundle.position.state,
            positionId: [positionBundle.id],
        });

        entries.push(entry);
    }

    yield new LpPositionBundleResponse({ entries });
};
