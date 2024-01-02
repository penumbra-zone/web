import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

import { offscreenClient } from '../offscreen-client';

import * as wasm from '@penumbra-zone/wasm-ts';

import { ConnectError, Code } from '@connectrpc/connect';

export const witnessAndBuild: Impl['witnessAndBuild'] = async (req, ctx) => {
  const services = ctx.values.get(servicesCtx);
  if (!req.authorizationData)
    throw new ConnectError('No authorization data in request', Code.InvalidArgument);
  if (!req.transactionPlan) throw new ConnectError('No tx plan in request', Code.InvalidArgument);

  const {
    indexedDb,
    viewServer: { fullViewingKey },
  } = await services.getWalletServices();
  const sct = await indexedDb.getStateCommitmentTree();

  let witnessData;
  try {
    witnessData = wasm.witness(req.transactionPlan, sct);
  } catch (wasmErr) {
    throw new ConnectError('WASM failed to witness transaction plan', Code.Internal);
  }

  const batchActions = await offscreenClient.buildAction(req, witnessData, fullViewingKey);

  let transaction;
  try {
    transaction = wasm.buildParallel(
      batchActions,
      req.transactionPlan,
      witnessData,
      req.authorizationData,
    );
  } catch (wasmErr) {
    throw new ConnectError('WASM failed to build transaction', Code.Internal);
  }

  return { transaction };
};
