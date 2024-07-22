import { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';

export const timestampByHeight: Impl['timestampByHeight'] = async (req, ctx) => {
  const services = await ctx.values.get(servicesCtx)();
  const { querier } = await services.getWalletServices();

  return querier.sct.timestampByHeight(req);
};
