import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

import { offscreenClient } from '../offscreen-client';

import { buildParallel, getWitness } from '@penumbra-zone/wasm-ts';

import { ConnectError, Code } from '@connectrpc/connect';

export const witnessAndBuild: Impl['witnessAndBuild'] = async function* (req, ctx) {
  const services = ctx.values.get(servicesCtx);
  if (!req.authorizationData)
    throw new ConnectError('No authorization data in request', Code.InvalidArgument);
  if (!req.transactionPlan) throw new ConnectError('No tx plan in request', Code.InvalidArgument);

  const {
    indexedDb,
    viewServer: { fullViewingKey },
  } = await services.getWalletServices();
  const sct = await indexedDb.getStateCommitmentTree();

  const witnessData = getWitness(req.transactionPlan, sct);

  const batchActions = await offscreenClient.buildAction(
    req.transactionPlan,
    witnessData,
    fullViewingKey,
  );

  const transaction = buildParallel(
    batchActions,
    req.transactionPlan,
    witnessData,
    req.authorizationData,
  );

  yield {
    status: {
      case: 'complete',
      value: { transaction },
    },
  };
};
