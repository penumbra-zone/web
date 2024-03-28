import {
  Action,
  AuthorizationData,
  Transaction,
  TransactionPlan,
  WitnessData,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import type { StateCommitmentTree } from '@penumbra-zone/types/src/state-commitment-tree';
import { JsonValue } from '@bufbuild/protobuf';
import { authorize, build_action, build_parallel, load_proving_key, witness } from '../wasm';
import { ActionType, provingKeys } from './proving-keys';
import {
  FullViewingKey,
  SpendKey,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

export const authorizePlan = (spendKey: SpendKey, txPlan: TransactionPlan): AuthorizationData => {
  const result = authorize(spendKey.toBinary(), txPlan.toJson()) as JsonValue;
  return AuthorizationData.fromJson(result);
};

export const getWitness = (txPlan: TransactionPlan, sct: StateCommitmentTree): WitnessData => {
  const result = witness(txPlan.toJson(), sct) as JsonValue;
  return WitnessData.fromJson(result);
};

export const buildParallel = (
  batchActions: Action[],
  txPlan: TransactionPlan,
  witnessData: WitnessData,
  authData: AuthorizationData,
): Transaction => {
  const result = build_parallel(
    batchActions.map(action => action.toJson()),
    txPlan.toJson(),
    witnessData.toJson(),
    authData.toJson(),
  ) as JsonValue;
  return Transaction.fromJson(result);
};

export const buildActionParallel = async (
  txPlan: TransactionPlan,
  witnessData: WitnessData,
  fullViewingKey: FullViewingKey,
  actionId: number,
): Promise<Action> => {
  // Conditionally read proving keys from disk and load keys into WASM binary
  const actionType = txPlan.actions[actionId]?.action.case;
  if (!actionType) throw new Error('No action key provided');
  await loadProvingKey(actionType);

  const result = build_action(
    txPlan.toJson(),
    txPlan.actions[actionId]?.toJson(),
    fullViewingKey.toBinary(),
    witnessData.toJson(),
  ) as JsonValue;

  return Action.fromJson(result);
};

const loadProvingKey = async (actionType: ActionType) => {
  const keyType = provingKeys[actionType];
  if (!keyType) return;

  const res = await fetch(`bin/${keyType}_pk.bin`);
  const buffer = await res.arrayBuffer();
  const uint8Array = new Uint8Array(buffer);
  load_proving_key(uint8Array, keyType);
};
