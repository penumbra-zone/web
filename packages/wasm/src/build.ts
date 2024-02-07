import {
  Action,
  AuthorizationData,
  Transaction,
  TransactionPlan,
  WitnessData,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { StateCommitmentTree } from '@penumbra-zone/types';
import { JsonValue } from '@bufbuild/protobuf';
import { authorize, build_action, build_parallel, witness } from '@penumbra-zone/wasm-bundler';

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

export const buildActionParallel = (
  txPlan: TransactionPlan,
  witnessData: WitnessData,
  fullViewingKey: string,
  actionId: number,
): Action => {
  const result = build_action(
    txPlan.toJson(),
    txPlan.actions[actionId]?.toJson(),
    fullViewingKey,
    witnessData.toJson(),
  ) as unknown;

  return Action.fromJson(result as JsonValue);
};
