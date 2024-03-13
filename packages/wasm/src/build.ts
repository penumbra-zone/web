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

export const authorizePlan = (spendKey: string, txPlan: TransactionPlan): AuthorizationData => {
  const result = authorize(spendKey, txPlan.toJson()) as unknown;
  return AuthorizationData.fromJsonString(JSON.stringify(result));
};

export const getWitness = (txPlan: TransactionPlan, sct: StateCommitmentTree): WitnessData => {
  const result: unknown = witness(txPlan.toJson(), sct);
  return WitnessData.fromJsonString(JSON.stringify(result));
};

export const buildParallel = (
  batchActions: Action[],
  txPlan: TransactionPlan,
  witnessData: WitnessData,
  authData: AuthorizationData,
): Transaction => {
  const result: unknown = build_parallel(
    batchActions.map(action => action.toJson()),
    txPlan.toJson(),
    witnessData.toJson(),
    authData.toJson(),
  );
  return Transaction.fromJson(result as JsonValue);
};

export const buildActionParallel = async (
  txPlan: TransactionPlan,
  witnessData: WitnessData,
  fullViewingKey: string,
  actionId: number,
): Promise<Action> => {
  // Conditionally read proving keys from disk and load keys into WASM binary
  const actionType = txPlan.actions[actionId]?.action.case;
  if (!actionType) throw new Error('No action key provided');
  await loadProvingKey(actionType);

  const result = build_action(
    txPlan.toJson(),
    txPlan.actions[actionId]?.toJson(),
    fullViewingKey,
    witnessData.toJson(),
  ) as unknown;

  return Action.fromJson(result as JsonValue);
};

const loadProvingKey = async (actionType: ActionType) => {
  const keyType = provingKeys[actionType];
  if (!keyType) return;
  const keyBin = (await fetch(`bin/${keyType}_pk.bin`)).arrayBuffer();
  load_proving_key(await keyBin, keyType);
};
