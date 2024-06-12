import type { Impl } from '.';

import { Code, ConnectError } from '@connectrpc/connect';
import { getWitness } from '@penumbra-zone/wasm/build';
import { dbCtx } from '../ctx/database';

export const witness: Impl['witness'] = async (req, ctx) => {
  if (!req.transactionPlan) throw new ConnectError('No tx plan in request', Code.InvalidArgument);

  const indexedDb = await ctx.values.get(dbCtx)();
  const sct = await indexedDb.getStateCommitmentTree();

  const witnessData = getWitness(req.transactionPlan, sct);

  return { witnessData };
};
