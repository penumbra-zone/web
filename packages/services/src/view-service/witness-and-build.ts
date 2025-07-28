import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';

import { optimisticBuild } from './util/build-tx.js';

import { Code, ConnectError } from '@connectrpc/connect';
import { AuthorizationData } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { fvkCtx } from '../ctx/full-viewing-key.js';

export const witnessAndBuild: Impl['witnessAndBuild'] = async function* (
  { authorizationData, transactionPlan },
  ctx,
) {
  const services = await ctx.values.get(servicesCtx)();
  if (!transactionPlan) {
    throw new ConnectError('No tx plan', Code.InvalidArgument);
  }

  const { viewServer } = await services.getWalletServices();
  const fvk = ctx.values.get(fvkCtx);

  const witnessData = await viewServer.getWitnessData(transactionPlan);

  yield* optimisticBuild(
    transactionPlan,
    witnessData,
    Promise.resolve(authorizationData ?? new AuthorizationData()),
    await fvk(),
  );
};
