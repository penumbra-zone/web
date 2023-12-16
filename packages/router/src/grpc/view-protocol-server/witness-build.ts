import {
  WitnessAndBuildRequest,
  WitnessAndBuildResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewReqMessage } from './router';
import { ServicesInterface } from '@penumbra-zone/types';
import { build, witness } from '@penumbra-zone/wasm-ts';
import { localExtStorage } from '@penumbra-zone/storage';
import { handleOffscreen } from '../../../../../apps/extension/src/routes/offscreen/window-management';
import { Action } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { build_parallel } from '@penumbra-zone/wasm-bundler';

export const isWitnessBuildRequest = (msg: ViewReqMessage): msg is WitnessAndBuildRequest => {
  return msg.getType().typeName === WitnessAndBuildRequest.typeName;
};

export const handleWitnessBuildReq = async (
  req: WitnessAndBuildRequest,
  services: ServicesInterface,
): Promise<WitnessAndBuildResponse> => { 
  if (!req.authorizationData) throw new Error('No authorization data in request');
  if (!req.transactionPlan) throw new Error('No tx plan in request');

  const { indexedDb } = await services.getWalletServices();
  const sct = await indexedDb.getStateCommitmentTree();

  const witnessData = witness(req.transactionPlan, sct);

  const wallets = await localExtStorage.get('wallets');

  const { fullViewingKey } = wallets[0]!;

  let action_types: string[] = [];
  for (let i = 0; i < req.transactionPlan?.actions.length!; i++) {
    action_types.push(req.transactionPlan?.actions[i]!.action.case!)
  }

  const batchActions = await handleOffscreen(
    req, 
    witnessData, 
    fullViewingKey, 
    action_types
  );

  // Execute parallel build method
  const transaction = build_parallel(
    batchActions, 
    req.transactionPlan, 
    witnessData, 
    req.authorizationData
  )

  // const transaction = await build(
  //   fullViewingKey,
  //   req.transactionPlan,
  //   witnessData,
  //   req.authorizationData,
  // );

  return new WitnessAndBuildResponse({ transaction });
};
