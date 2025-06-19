import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';
import { custodyAuthorize } from './util/custody-authorize.js';
import { getWitness } from '@penumbra-zone/wasm/build';
import { Code, ConnectError } from '@connectrpc/connect';
import { fvkCtx } from '../ctx/full-viewing-key.js';
import { scheduleDelegatedProof } from '../delegated-proving.js';
import { optimisticBuild } from './util/build-tx.js';

export const authorizeAndBuild: Impl['authorizeAndBuild'] = async function* (
  { transactionPlan },
  ctx,
) {
  const services = await ctx.values.get(servicesCtx)();
  if (!transactionPlan) {
    throw new ConnectError('No tx plan in request', Code.InvalidArgument);
  }

  const { indexedDb } = await services.getWalletServices();
  const fvk = ctx.values.get(fvkCtx);

  const sct = await indexedDb.getStateCommitmentTree();
  const witnessData = getWitness(transactionPlan, sct);

  // 1. Build witnesses for every action in the plan
  let initialTasks = yield* optimisticBuild(
    transactionPlan,
    witnessData,
    custodyAuthorize(ctx, transactionPlan),
    await fvk(),
    'delegated',
  );

  const witnesses = initialTasks!.map(task => task.witness);
  const public_inputs = initialTasks!.map(task => task.public_inputs);

  // 2. Kick off delegated (remote) proof generation
  await scheduleDelegatedProof(witnesses, public_inputs);

  // 3. (todo) instead of awaiting the remote proof, launch a local `optimisticBuild`
  // in parallel and race the two promises, keeping whichever proof finishes first.
};
