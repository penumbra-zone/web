import {
  Action,
  AuthorizationData,
  Transaction,
  TransactionPlan,
  WitnessData,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import {
  StateCommitmentTree,
  validateSchema,
  WasmAuthorizeSchema,
  WasmBuildSchema,
  WasmWitnessDataSchema,
} from '@penumbra-zone/types';
import {
  authorize,
  build as wasmBuild,
  build_parallel as wasmBuildParallel,
  witness as wasmWitness,
} from '@penumbra-zone/wasm-bundler';
import { loadProvingKeys } from '../src/utils';

export const authorizePlan = (spendKey: string, txPlan: TransactionPlan): AuthorizationData => {
  const result = validateSchema(WasmAuthorizeSchema, authorize(spendKey, txPlan.toJson()));
  return AuthorizationData.fromJsonString(JSON.stringify(result));
};

export const witness = (txPlan: TransactionPlan, sct: StateCommitmentTree): WitnessData => {
  const result = validateSchema(WasmWitnessDataSchema, wasmWitness(txPlan.toJson(), sct));
  return WitnessData.fromJsonString(JSON.stringify(result));
};

export const build = async (
  fullViewingKey: string,
  txPlan: TransactionPlan,
  witnessData: WitnessData,
  authData: AuthorizationData,
): Promise<Transaction> => {
  await loadProvingKeys();

  const result = validateSchema(
    WasmBuildSchema,
    wasmBuild(fullViewingKey, txPlan.toJson(), witnessData.toJson(), authData.toJson()),
  );
  return Transaction.fromJsonString(JSON.stringify(result));
};

export const build_parallel = async (
  batchActions: Action[],
  txPlan: TransactionPlan,
  witnessData: WitnessData,
  authData: AuthorizationData,
): Promise<Transaction> => {
  const result = validateSchema(
    WasmBuildSchema,
    await wasmBuildParallel(batchActions, txPlan.toJson(), witnessData.toJson(), authData.toJson()),
  );

  return Transaction.fromJsonString(JSON.stringify(result));
};
