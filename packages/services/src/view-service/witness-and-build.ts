import type { Impl } from '.';

import { AuthorizationData } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { Code, ConnectError } from '@connectrpc/connect';
import { getWitness } from '@penumbra-zone/wasm/build';
import { dbCtx } from '../ctx/database';
import { fvkCtx } from '../ctx/full-viewing-key';
import { optimisticBuild } from './util/build-tx';
import { offscreenCtx } from '../ctx/offscreen';

export const witnessAndBuild: Impl['witnessAndBuild'] = async function* (
  { authorizationData, transactionPlan },
  ctx,
) {
  if (!transactionPlan) throw new ConnectError('No tx plan', Code.InvalidArgument);

  const indexedDb = await ctx.values.get(dbCtx)();
  const offscreenUrl = ctx.values.get(offscreenCtx);
  const fvk = ctx.values.get(fvkCtx);

  const sct = await indexedDb.getStateCommitmentTree();

  const witnessData = getWitness(transactionPlan, sct);

  yield* optimisticBuild(
    offscreenUrl,
    transactionPlan,
    witnessData,
    Promise.resolve(authorizationData ?? new AuthorizationData()),
    await fvk(),
  );
};
