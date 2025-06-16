import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';
import { optimsiticDelegatedBuild } from './util/build-tx.js';
import { custodyAuthorize } from './util/custody-authorize.js';
import { getWitness } from '@penumbra-zone/wasm/build';
import { Code, ConnectError } from '@connectrpc/connect';
import { fvkCtx } from '../ctx/full-viewing-key.js';
import { delegateProof } from '../delegated-proving.js';

export const authorizeAndBuild: Impl['authorizeAndBuild'] = async function* (
  { transactionPlan },
  ctx,
) {
  console.log('entered authorizeAndBuild!');

  const services = await ctx.values.get(servicesCtx)();
  if (!transactionPlan) {
    throw new ConnectError('No tx plan in request', Code.InvalidArgument);
  }

  const { indexedDb } = await services.getWalletServices();
  const fvk = ctx.values.get(fvkCtx);

  const sct = await indexedDb.getStateCommitmentTree();
  const witnessData = getWitness(transactionPlan, sct);

  const startTime = performance.now();

  let completedTasks = yield* optimsiticDelegatedBuild(
    transactionPlan,
    witnessData,
    custodyAuthorize(ctx, transactionPlan),
    await fvk(),
  );

  const finalTime = performance.now();
  const totalDuration = finalTime - startTime;

  console.log('optimsiticDelegatedBuild completed', {
    totalDurationMs: totalDuration,
    startTime,
    endTime: finalTime,
  });

  console.log("completedTasks: ", completedTasks)

  const witnesses = completedTasks.map(task => task.witness);
  await delegateProof(witnesses);

  // yield* optimisticBuild(
  //   transactionPlan,
  //   witnessData,
  //   custodyAuthorize(ctx, transactionPlan),
  //   await fvk(),
  // );
};
