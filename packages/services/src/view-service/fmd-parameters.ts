import type { Impl } from '.';
import { servicesCtx } from '../ctx/prax';

import { Code, ConnectError } from '@connectrpc/connect';

export const fMDParameters: Impl['fMDParameters'] = async (_, ctx) => {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();
  const parameters = await indexedDb.getFmdParams();
  if (!parameters) {
    throw new ConnectError('No FMD parameters', Code.FailedPrecondition);
  }
  return { parameters };
};
