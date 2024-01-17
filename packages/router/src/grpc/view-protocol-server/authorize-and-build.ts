import type { Impl } from '.';
import { servicesCtx } from '../../ctx';
import { offscreenClient } from '../offscreen-client';
import { buildParallel, getWitness } from '@penumbra-zone/wasm-ts';
import { ConnectError, Code } from '@connectrpc/connect';
// import { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1alpha1/custody_pb';
// import { authorize } from '../custody/authorize';
// import { AuthorizationData } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

export const authorizeAndBuild: Impl['authorizeAndBuild'] = async (req, ctx) => {
    console.log("Entered authorizeAndBuild!")

    // Instance of gRPC client (custodyClient) for the Custody Protocol service
    // const custody = ctx.values.get(custodyCtx);


    if (!req.transactionPlan) throw new ConnectError('No tx plan in request', Code.InvalidArgument);

    // Request authorization data without awaiting
    // const authorizationDataPromise = await authorize(new AuthorizeRequest ({ plan: req.transactionPlan! }), ctx)!;
    // console.log("authorizationDataPromise is: ", authorizationDataPromise)

    const services = ctx.values.get(servicesCtx);

    const {
      indexedDb,
      viewServer: { fullViewingKey },
    } = await services.getWalletServices();
    const sct = await indexedDb.getStateCommitmentTree();
  
    const witnessData = getWitness(req.transactionPlan!, sct);
  
    const batchActions = await offscreenClient.buildAction(req.transactionPlan!, witnessData, fullViewingKey);
  
    const transaction = buildParallel(
      batchActions,
      req.transactionPlan!,
      witnessData,
      req.authorizationData!
    );

    // (await authorizationDataPromise).data as AuthorizationData,
  
    return { transaction };
  };
  