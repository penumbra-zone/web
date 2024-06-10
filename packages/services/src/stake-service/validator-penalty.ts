import { Impl } from '.';
import { servicesCtx } from '../ctx/prax';

export const validatorPenalty: Impl['validatorPenalty'] = async (req, ctx) => {
  const services = await ctx.values.get(servicesCtx)();
  const { querier } = await services.getWalletServices();
  return querier.stake.validatorPenalty(req);
};
