import { Impl } from '.';
import { servicesCtx } from '../../ctx';

export const validatorPenalty: Impl['validatorPenalty'] = async (req, ctx) => {
  const services = ctx.values.get(servicesCtx);
  return services.querier.staking.validatorPenalty(req);
};
