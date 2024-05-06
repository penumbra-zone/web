import type { Impl } from '.';
import { servicesCtx } from '../ctx/prax';
import { optimisticBuild } from './util/build-tx';
import { custodyAuthorize } from './util/custody-authorize';
import { getWitness } from '@penumbra-zone/wasm/build';
import { Code, ConnectError } from '@connectrpc/connect';
import { fvkCtx } from '../ctx/full-viewing-key';

export const authorizeAndBuild: Impl['authorizeAndBuild'] = async function* (
  { transactionPlan },
  ctx,
) {
  const services = await ctx.values.get(servicesCtx)();
  if (!transactionPlan) throw new ConnectError('No tx plan in request', Code.InvalidArgument);

  const { indexedDb } = await services.getWalletServices();
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
