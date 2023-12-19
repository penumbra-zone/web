import {
  WitnessAndBuildRequest,
  WitnessAndBuildResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewReqMessage } from './router';
import { ServicesInterface } from '@penumbra-zone/types';
import { buildParallel, witness } from '@penumbra-zone/wasm-ts';
import { localExtStorage } from '@penumbra-zone/storage';
// import { handleOffscreenAPI } from '../../../../../apps/extension/src/routes/offscreen/window-management';
import { offscreenClient } from '../../../../../apps/extension/src/routes/offscreen/offscreen';

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

  const action_types: string[] = [];
  for (const action of req.transactionPlan.actions) {
    if (!action.action.case) throw new Error('Case not provided');
    action_types.push(action.action.case);
  }

  const batchActions = await offscreenClient.buildAction(
    req,
    witnessData,
    fullViewingKey,
    action_types,
  );
  if ('error' in batchActions) throw new Error('failed to build action');

  const transaction = buildParallel(
    batchActions.data,
    req.transactionPlan,
    witnessData,
    req.authorizationData,
  );

  return new WitnessAndBuildResponse({ transaction });
};
