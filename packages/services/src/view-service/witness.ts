import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';
import { Code, ConnectError } from '@connectrpc/connect';

export const witness: Impl['witness'] = async (req, ctx) => {
  const services = await ctx.values.get(servicesCtx)();

  if (!req.transactionPlan) {
    throw new ConnectError('No tx plan in request', Code.InvalidArgument);
  }

  const { viewServer } = await services.getWalletServices();

  const witnessData = await viewServer.getWitnessData(req.transactionPlan);

  return { witnessData };
};
