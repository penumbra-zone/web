import {
  Action,
  AuthorizationData,
  Transaction,
  TransactionPlan,
  WitnessData,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { JsonValue } from '@bufbuild/protobuf';
import {
  StateCommitmentTree,
  validateSchema,
  WasmActionSchema,
  WasmAuthorizeSchema,
  WasmBuildSchema,
  WasmWitnessDataSchema,
} from '@penumbra-zone/types';
import {
  authorize,
  build_parallel as buildTxParallel,
  build_action as buildAction,
  witness as wasmWitness,
} from '@penumbra-zone/wasm-bundler';

export const authorizePlan = (spendKey: string, txPlan: TransactionPlan): AuthorizationData => {
  const result = validateSchema(WasmAuthorizeSchema, authorize(spendKey, txPlan.toJson()));
  return AuthorizationData.fromJsonString(JSON.stringify(result));
};

export const witness = (txPlan: TransactionPlan, sct: StateCommitmentTree): WitnessData => {
  const result = validateSchema(WasmWitnessDataSchema, wasmWitness(txPlan.toJson(), sct));
  return WitnessData.fromJsonString(JSON.stringify(result));
};

export const buildParallel = (
  batchActions: Action[],
  txPlan: TransactionPlan,
  witnessData: WitnessData,
  authData: AuthorizationData,
): Transaction => {
  const result = validateSchema(
    WasmBuildSchema,
    buildTxParallel(batchActions, txPlan.toJson(), witnessData.toJson(), authData.toJson()),
  );

  return Transaction.fromJson(result as JsonValue);
};

export const buildActionParallel = (
  txPlan: TransactionPlan,
  witnessData: WitnessData,
  fullViewingKey: string,
  actionId: number,
): Action => {
  const result = validateSchema(
    WasmActionSchema,
    buildAction(
      txPlan.toJson(),
      txPlan.actions[actionId]?.toJson(),
      fullViewingKey,
      witnessData.toJson(),
    ),
  );

  return Action.fromJson(result as JsonValue);
};
