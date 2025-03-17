import type { Impl } from './index.js';
import { create } from '@bufbuild/protobuf';
import { servicesCtx } from '../ctx/prax.js';

import { optimisticBuild } from './util/build-tx.js';

import { getWitness } from '@penumbra-zone/wasm/build';

import { Code, ConnectError } from '@connectrpc/connect';
import { AuthorizationDataSchema } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { fvkCtx } from '../ctx/full-viewing-key.js';

export const witnessAndBuild: Impl['witnessAndBuild'] = async function* (
  { authorizationData, transactionPlan },
  ctx,
) {
  const services = await ctx.values.get(servicesCtx)();
  if (!transactionPlan) {
    throw new ConnectError('No tx plan', Code.InvalidArgument);
  }

  const { indexedDb } = await services.getWalletServices();
  const fvk = ctx.values.get(fvkCtx);

  const sct = await indexedDb.getStateCommitmentTree();

  const witnessData = getWitness(transactionPlan, sct);

  yield* optimisticBuild(
    transactionPlan,
    witnessData,
    Promise.resolve(authorizationData ?? create(AuthorizationDataSchema)),
    await fvk(),
  );
};
