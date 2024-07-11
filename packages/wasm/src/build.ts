import {
  Action,
  AuthorizationData,
  Transaction,
  TransactionPlan,
  WitnessData,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb.js';
import type { StateCommitmentTree } from '@penumbra-zone/types/state-commitment-tree';
import {
  authorize,
  build_action,
  build_parallel,
  load_proving_key,
  witness,
} from '../wasm/index.js';
import {
  FullViewingKey,
  SpendKey,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb.js';

export const authorizePlan = (spendKey: SpendKey, txPlan: TransactionPlan): AuthorizationData => {
  const result = authorize(spendKey.toBinary(), txPlan.toBinary());
  return AuthorizationData.fromBinary(result);
};

export const getWitness = (txPlan: TransactionPlan, sct: StateCommitmentTree): WitnessData => {
  const result = witness(txPlan.toBinary(), sct);
  return WitnessData.fromBinary(result);
};

export const buildParallel = (
  batchActions: Action[],
  txPlan: TransactionPlan,
  witnessData: WitnessData,
  authData: AuthorizationData,
): Transaction => {
  const result = build_parallel(
    batchActions.map(action => action.toJson()),
    txPlan.toBinary(),
    witnessData.toBinary(),
    authData.toBinary(),
  );
  return Transaction.fromBinary(result);
};

export const buildActionParallel = async (
  txPlan: TransactionPlan,
  witnessData: WitnessData,
  fullViewingKey: FullViewingKey,
  actionId: number,
  keyPath?: string,
): Promise<Action> => {
  // Conditionally read proving keys from disk and load keys into WASM binary
  const actionPlan = txPlan.actions[actionId];
  if (!actionPlan?.action.case) {
    throw new Error('No action key provided');
  }
  if (keyPath) {
    await loadProvingKey(actionPlan.action.case, keyPath);
  }

  const result = build_action(
    txPlan.toBinary(),
    actionPlan.toBinary(),
    fullViewingKey.toBinary(),
    witnessData.toBinary(),
  );

  return Action.fromBinary(result);
};

const loadProvingKey = async (
  actionType: Exclude<Action['action']['case'], undefined>,
  keyPath: string,
) => {
  const key = new Uint8Array(await (await fetch(keyPath)).arrayBuffer());
  load_proving_key(key, actionType);
};
