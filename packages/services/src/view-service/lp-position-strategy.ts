import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';
import {
  LpPositionBundleResponse,
  LpPositionBundleResponse_Entry,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

export const lpPositionBundle: Impl['lpPositionBundle'] = async function* (req, ctx) {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();

  const entries: LpPositionBundleResponse_Entry[] | undefined = [];
  for await (const positionBundle of indexedDb.getPositionsByStrategyStream(
    req.subaccount,
    req.positionMetadata,
    req.positionState,
    req.tradingPair,
  )) {
    const entry = new LpPositionBundleResponse_Entry({
      tradingPair: positionBundle.position.phi?.pair,
      subaccount: positionBundle.subaccount,
      positionMetadata: positionBundle.positionMetadata,
      positionState: positionBundle.position.state,
      positionId: [positionBundle.id],
    });

    entries.push(entry);
  }

  yield new LpPositionBundleResponse({ entries });
};
