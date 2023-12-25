import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

import { offscreenClient } from '../offscreen-client';

import { buildParallel, witness } from '@penumbra-zone/wasm-ts';

export const witnessAndBuild: Impl['witnessAndBuild'] = async (req, ctx) => {
  const services = ctx.values.get(servicesCtx);
  if (!req.authorizationData) throw new Error('No authorization data in request');
  if (!req.transactionPlan) throw new Error('No tx plan in request');

  const {
    indexedDb,
    viewServer: { fullViewingKey },
  } = await services.getWalletServices();
  const sct = await indexedDb.getStateCommitmentTree();

  const witnessData = witness(req.transactionPlan, sct);

  const batchActions = await offscreenClient.buildAction(req, witnessData, fullViewingKey);

  const transaction = buildParallel(
    batchActions,
    req.transactionPlan,
    witnessData,
    req.authorizationData,
  );

  return { transaction };
};
