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
import { ActionPlan, Transaction, TransactionPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

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

  console.log('req.transactionPlan is: ', req.transactionPlan)

  const ts = req.transactionPlan?.toJson()
  console.log('req.transactionPlan json is: ', ts)
  console.log('req.transactionPlan from json is: ', TransactionPlan.fromJson(ts))
  console.log("??????????????????????????????????????????????")

  const batchActions = await offscreenClient.buildAction(
    req,
    witnessData,
    fullViewingKey,
    req.transactionPlan.actions.length,
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
