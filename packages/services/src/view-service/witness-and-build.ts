import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';
import { buildCtx } from '../ctx/build.js';
import { getWitness } from '@penumbra-zone/wasm/build';
import { Code, ConnectError } from '@connectrpc/connect';
import { progressStream } from './util/progress-stream.js';

export const witnessAndBuild: Impl['witnessAndBuild'] = async function* (
  { authorizationData, transactionPlan },
  ctx,
) {
  const services = await ctx.values.get(servicesCtx)();
  if (!transactionPlan) {
    throw new ConnectError('Transaction plan required', Code.InvalidArgument);
  }
  if (!authorizationData) {
    throw new ConnectError('Authorization data required', Code.Unauthenticated);
  }

  const { indexedDb } = await services.getWalletServices();

  const sct = await indexedDb.getStateCommitmentTree();

  const witnessData = getWitness(transactionPlan, sct);

  const { buildActions, buildTransaction } = ctx.values.get(buildCtx);
  const tasks = await buildActions({ transactionPlan, witnessData }, ctx.signal);

  // status updates
  yield* progressStream(tasks);

  const transaction = await buildTransaction(
    { transactionPlan, witnessData, actions: await Promise.all(tasks), authorizationData },
    ctx.signal,
  );

  yield {
    status: {
      case: 'complete',
      value: { transaction },
    },
  };
};
