import type { Impl } from '.';
import { servicesCtx } from '../ctx/prax';

import { getWitness } from '@penumbra-zone/wasm/src/build';

import { Code, ConnectError } from '@connectrpc/connect';

export const witness: Impl['witness'] = async (req, ctx) => {
  const services = ctx.values.get(servicesCtx);

  if (!req.transactionPlan) throw new ConnectError('No tx plan in request', Code.InvalidArgument);

  const { indexedDb } = await services.getWalletServices();
  const sct = await indexedDb.getStateCommitmentTree();

  const witnessData = getWitness(req.transactionPlan, sct);

  return { witnessData };
};
