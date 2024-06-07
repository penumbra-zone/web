import { Code, ConnectError } from '@connectrpc/connect';
import { getWitness } from '@penumbra-zone/wasm/build';
import type { Impl } from '.';
import { idbCtx } from '../ctx/prax';

export const witness: Impl['witness'] = async (req, ctx) => {
  if (!req.transactionPlan) throw new ConnectError('No tx plan in request', Code.InvalidArgument);

  const idb = await ctx.values.get(idbCtx)();
  const sct = await idb.getStateCommitmentTree();

  const witnessData = getWitness(req.transactionPlan, sct);

  return { witnessData };
};
