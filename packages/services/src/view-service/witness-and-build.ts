import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';
import { buildTransaction } from './util/build-tx.js';
import { getWitness } from '@rotko/penumbra-wasm/build';
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

  const { indexedDb } = await services.getWalletServices();
  const fvk = ctx.values.get(fvkCtx);

  const sct = await indexedDb.getStateCommitmentTree();
  const witnessData = getWitness(transactionPlan, sct);

  yield* buildTransaction(
    transactionPlan,
    witnessData,
    Promise.resolve(authorizationData ?? new AuthorizationData()),
    await fvk(),
  );
};
