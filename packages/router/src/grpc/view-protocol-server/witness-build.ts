import {
  WitnessAndBuildRequest,
  WitnessAndBuildResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewReqMessage } from './router';
import { ServicesInterface } from '@penumbra-zone/types';
import { build_parallel, witness } from '@penumbra-zone/wasm-ts';
import { localExtStorage } from '@penumbra-zone/storage';
import { handleOffscreenAPI } from '../../../../../apps/extension/src/routes/offscreen/window-management';

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

  const action_types = [];
  for (const action of req.transactionPlan.actions) {
    action_types.push(action.action.case!);
  }

  const batchActions = await handleOffscreenAPI(req, witnessData, fullViewingKey, action_types);

  const transaction = build_parallel(
    batchActions,
    req.transactionPlan,
    witnessData,
    req.authorizationData,
  );

  return new WitnessAndBuildResponse({ transaction });
};
