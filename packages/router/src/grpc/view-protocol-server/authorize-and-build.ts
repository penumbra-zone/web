import type { Impl } from '.';
import { custodyCtx, servicesCtx } from '../../ctx';
import { offscreenClient } from '../offscreen-client';
import { buildParallel, getWitness } from '@penumbra-zone/wasm-ts';
import { ConnectError, Code } from '@connectrpc/connect';
import { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1alpha1/custody_pb';
import { authorize } from '../custody/authorize';
import { AuthorizationData } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

export const authorizeAndBuild: Impl['authorizeAndBuild'] = async (req, ctx) => {
  if (!req.transactionPlan) throw new ConnectError('No tx plan in request', Code.InvalidArgument);

  // Request authorization data without awaiting
  // const authorizationDataPromise = authorize(
  //   new AuthorizeRequest({ plan: req.transactionPlan }),
  //   ctx,
  // )!;

  // Instance of gRPC client (custodyClient) for the Custody Protocol service
  const custodyClient = ctx.values.get(custodyCtx);

  // Request authorization data (remove await)
  const { data: authorizationData } = await custodyClient.authorize({ plan: req.transactionPlan });
  if (!authorizationData) throw new Error('no authorization data in response');
  console.log("authorizationData is: ", authorizationData)

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
    // (await authorizationDataPromise).data as AuthorizationData,
    authorizationData
  );

  return { transaction };
};
