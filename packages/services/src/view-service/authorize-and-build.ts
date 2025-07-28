import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';
import { optimisticBuild } from './util/build-tx.js';
import { custodyAuthorize } from './util/custody-authorize.js';
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

  const { viewServer } = await services.getWalletServices();
  const fvk = ctx.values.get(fvkCtx);

  yield* optimisticBuild(
    transactionPlan,
    await viewServer.getWitnessData(transactionPlan),
    custodyAuthorize(ctx, transactionPlan),
    await fvk(),
  );
};
