import type { Impl } from '.';
import { servicesCtx } from '../../ctx/prax';

import { optimisticBuild } from './util/build-tx';

import { getWitness } from '@penumbra-zone/wasm/src/build';

import { Code, ConnectError } from '@connectrpc/connect';
import { AuthorizationData } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';

export const witnessAndBuild: Impl['witnessAndBuild'] = async function* (
  { authorizationData, transactionPlan },
  ctx,
) {
  const services = ctx.values.get(servicesCtx);
  if (!transactionPlan) throw new ConnectError('No tx plan', Code.InvalidArgument);

  const {
    indexedDb,
    viewServer: { fullViewingKey },
  } = await services.getWalletServices();
  const sct = await indexedDb.getStateCommitmentTree();

  const witnessData = getWitness(transactionPlan, sct);

  yield* optimisticBuild(
    transactionPlan,
    witnessData,
    Promise.resolve(authorizationData ?? new AuthorizationData()),
    fullViewingKey,
  );
};
