import {
  WitnessAndBuildRequest,
  WitnessAndBuildResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewReqMessage } from './router';
import { ServicesInterface } from '@penumbra-zone/types';
import { buildParallel, witness } from '@penumbra-zone/wasm-ts';
import { localExtStorage } from '@penumbra-zone/storage';
import { offscreenClient } from '../offscreen-client';

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

  // Start timer
  const startTime = performance.now(); // Record start time

  const batchActions = await offscreenClient.buildAction(req, witnessData, fullViewingKey);
  if ('error' in batchActions) throw new Error('failed to build action');

  const transaction = buildParallel(
    batchActions.data,
    req.transactionPlan,
    witnessData,
    req.authorizationData,
  );

  console.log('tx is: ', transaction);

  // End timer
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  console.log(`Parallel transaction execution time: ${executionTime} milliseconds`);

  return new WitnessAndBuildResponse({ transaction });
};
