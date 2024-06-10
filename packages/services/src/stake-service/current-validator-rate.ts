import { Impl } from '.';
import { servicesCtx } from '../ctx/prax';

export const currentValidatorRate: Impl['currentValidatorRate'] = async (req, ctx) => {
  const services = await ctx.values.get(servicesCtx)();
  const { querier } = await services.getWalletServices();
  return querier.stake.currentValidatorRate(req);
};
