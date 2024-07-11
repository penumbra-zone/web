import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';

import { getWitness } from '@penumbra-zone/wasm/build';

import { Code, ConnectError } from '@connectrpc/connect';

export const witness: Impl['witness'] = async (req, ctx) => {
  const services = await ctx.values.get(servicesCtx)();

  if (!req.transactionPlan) {
    throw new ConnectError('No tx plan in request', Code.InvalidArgument);
  }

  const { indexedDb } = await services.getWalletServices();
  const sct = await indexedDb.getStateCommitmentTree();

  const witnessData = getWitness(req.transactionPlan, sct);

  return { witnessData };
};
