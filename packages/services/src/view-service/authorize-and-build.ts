import type { Impl } from '.';

import { Code, ConnectError } from '@connectrpc/connect';
import { getWitness } from '@penumbra-zone/wasm/build';
import { dbCtx } from '../ctx/database';
import { fvkCtx } from '../ctx/full-viewing-key';
import { optimisticBuild } from './util/build-tx';
import { custodyAuthorize } from './util/custody-authorize';

export const authorizeAndBuild: Impl['authorizeAndBuild'] = async function* (
  { transactionPlan },
  ctx,
) {
  if (!transactionPlan) throw new ConnectError('No tx plan in request', Code.InvalidArgument);

  const indexedDb = await ctx.values.get(dbCtx)();
  const fvk = ctx.values.get(fvkCtx);

  const sct = await indexedDb.getStateCommitmentTree();
  const witnessData = getWitness(transactionPlan, sct);

  yield* optimisticBuild(
    transactionPlan,
    witnessData,
    custodyAuthorize(ctx, transactionPlan),
    await fvk(),
  );
};
