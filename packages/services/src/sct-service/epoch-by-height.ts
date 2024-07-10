import { EpochByHeightResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1/sct_pb.js';
import { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';

export const epochByHeight: Impl['epochByHeight'] = async (req, ctx) => {
  const { height } = req;

  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();

  const epoch = await indexedDb.getEpochByHeight(height);

  return new EpochByHeightResponse({ epoch });
};
