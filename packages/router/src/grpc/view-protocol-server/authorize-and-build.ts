import type { Impl } from '.';
import { custodyCtx, servicesCtx } from '../../ctx';
import { offscreenClient } from '../offscreen-client';
import { buildParallel, getWitness } from '@penumbra-zone/wasm-ts';
import { ConnectError, Code } from '@connectrpc/connect';

export const authorizeAndBuild: Impl['authorizeAndBuild'] = async (req, ctx) => {
  if (!req.transactionPlan) throw new ConnectError('No tx plan in request', Code.InvalidArgument);

  const custodyClient = ctx.values.get(custodyCtx);

  if (!custodyClient)
    throw new ConnectError('Cannot access custody service', Code.FailedPrecondition);

  const authorizationData = custodyClient.authorize({ plan: req.transactionPlan }).then(res => {
    if (res.data) return res.data;
    else throw new ConnectError('No authorization data in response', Code.PermissionDenied);
  });

  const services = ctx.values.get(servicesCtx);
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
    await authorizationData,
  );

  return { transaction };
};
