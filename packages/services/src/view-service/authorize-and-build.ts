import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';
import { buildTransaction } from './util/build-tx.js';
import { custodyAuthorize } from './util/custody-authorize.js';
import { getWitness } from '@rotko/penumbra-wasm/build';
import { Code, ConnectError } from '@connectrpc/connect';
import { fvkCtx } from '../ctx/full-viewing-key.js';

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

  yield* buildTransaction(
    transactionPlan,
    witnessData,
    custodyAuthorize(ctx, transactionPlan),
    await fvk(),
  );
};
