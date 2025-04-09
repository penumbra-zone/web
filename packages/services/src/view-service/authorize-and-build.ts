import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';
import { getWitness } from '@penumbra-zone/wasm/build';
import { Code, ConnectError } from '@connectrpc/connect';
import { custodyClientCtx } from '../ctx/custody-client.js';
import { buildCtx } from '../ctx/build.js';
import { progressStream } from './util/progress-stream.js';

export const authorizeAndBuild: Impl['authorizeAndBuild'] = async function* (
  { transactionPlan },
  ctx,
) {
  const services = await ctx.values.get(servicesCtx)();
  if (!transactionPlan) {
    throw new ConnectError('Transaction plan required', Code.InvalidArgument);
  }

  const custodyClient = ctx.values.get(custodyClientCtx);
  if (!custodyClient) {
    throw new ConnectError('Cannot access custody service', Code.FailedPrecondition);
  }

  const { indexedDb } = await services.getWalletServices();
  const sct = await indexedDb.getStateCommitmentTree();

  const witnessData = getWitness(transactionPlan, sct);

  const authorize = custodyClient
    .authorize({ plan: transactionPlan }, { timeoutMs: 0 })
    .then(
      ({ data }) =>
        data ?? Promise.reject(ConnectError.from('Unauthorized', Code.PermissionDenied)),
    );

  const { buildActions, buildTransaction } = ctx.values.get(buildCtx);
  const tasks = buildActions({ transactionPlan, witnessData }, ctx.signal);

  // status updates
  yield* progressStream([...tasks, authorize]);

  const transaction = await buildTransaction(
    {
      transactionPlan,
      witnessData,
      actions: await Promise.all(tasks),
      authorizationData: await authorize,
    },
    ctx.signal,
  );

  yield {
    status: {
      case: 'complete',
      value: { transaction },
    },
  };
};
