import type { Impl } from '.';
import { querierCtx } from '../ctx/prax';

export const validatorPenalty: Impl['validatorPenalty'] = async (req, ctx) => {
  const querier = await ctx.values.get(querierCtx)();
  return querier.stake.validatorPenalty(req);
};
