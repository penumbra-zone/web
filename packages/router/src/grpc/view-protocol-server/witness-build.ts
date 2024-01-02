import {
  WitnessAndBuildRequest,
  WitnessAndBuildResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewReqMessage } from './router';
import { ServicesInterface } from '@penumbra-zone/types';
import { buildParallel, witness } from '@penumbra-zone/wasm-ts';
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

  return new WitnessAndBuildResponse({ transaction });
};
