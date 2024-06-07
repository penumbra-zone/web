import type { Impl } from '.';
import { idbCtx } from '../ctx/prax';
import { optimisticBuild } from './util/build-tx';
import { custodyAuthorize } from './util/custody-authorize';
import { getWitness } from '@penumbra-zone/wasm/build';
import { Code, ConnectError } from '@connectrpc/connect';
import { fvkCtx } from '../ctx/full-viewing-key';

export const authorizeAndBuild: Impl['authorizeAndBuild'] = async function* (
  { transactionPlan },
  ctx,
) {
  if (!transactionPlan) throw new ConnectError('No tx plan in request', Code.InvalidArgument);

  const idb = await ctx.values.get(idbCtx)();
  const fvk = ctx.values.get(fvkCtx);

  const sct = await idb.getStateCommitmentTree();
  const witnessData = getWitness(transactionPlan, sct);

  yield* optimisticBuild(
    transactionPlan,
    witnessData,
    custodyAuthorize(ctx, transactionPlan),
    await fvk(),
  );
};
