import type { Impl } from '.';
import { custodyCtx, servicesCtx } from '../../ctx';
import { offscreenClient } from '../offscreen-client';
import { buildParallel, getWitness } from '@penumbra-zone/wasm';
import { ConnectError, Code, HandlerContext } from '@connectrpc/connect';
import { TransactionPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';

export const authorizeAndBuild: Impl['authorizeAndBuild'] = async function* (req, ctx) {
  if (!req.transactionPlan) throw new ConnectError('No tx plan in request', Code.InvalidArgument);

  const authorizationPromise = authorize(ctx, req.transactionPlan);
  const batchActionsPromise = buildBatchActions(ctx, req.transactionPlan);

  // Get authorization while building in the background
  const [authorizationData, batchActions] = await Promise.all([
    authorizationPromise,
    batchActionsPromise,
  ]);

  const transaction = buildParallel(
    batchActions.batchActions,
    req.transactionPlan,
    batchActions.witnessData,
    authorizationData,
  );

  yield {
    status: {
      case: 'complete',
      value: { transaction },
    },
  };
};

async function authorize(ctx: HandlerContext, transactionPlan: TransactionPlan) {
  const custodyClient = ctx.values.get(custodyCtx);
  if (!custodyClient)
    throw new ConnectError('Cannot access custody service', Code.FailedPrecondition);

  const response = await custodyClient.authorize({ plan: transactionPlan });
  if (response.data) {
    return response.data;
  } else {
    throw new ConnectError('No authorization data in response', Code.PermissionDenied);
  }
}

async function buildBatchActions(ctx: HandlerContext, transactionPlan: TransactionPlan) {
  const services = ctx.values.get(servicesCtx);
  const {
    indexedDb,
    viewServer: { fullViewingKey },
  } = await services.getWalletServices();
  const sct = await indexedDb.getStateCommitmentTree();
  const witnessData = getWitness(transactionPlan, sct);

  const batchActions = await offscreenClient.buildAction(
    transactionPlan,
    witnessData,
    fullViewingKey,
  );

  return {
    batchActions,
    witnessData,
  };
}
