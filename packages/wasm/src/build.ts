import {
  ActionSchema,
  AuthorizationDataSchema,
  TransactionSchema,
  TransactionPlan,
  WitnessDataSchema,
  Action,
  AuthorizationData,
  Transaction,
  WitnessData,
  TransactionPlanSchema,
  ActionPlanSchema,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';

import { fromBinary, toBinary, toJson } from '@bufbuild/protobuf';
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
  FullViewingKeySchema,
  SpendKey,
  SpendKeySchema,
} from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

export const authorizePlan = (spendKey: SpendKey, txPlan: TransactionPlan): AuthorizationData => {
  const result = authorize(
    toBinary(SpendKeySchema, spendKey),
    toBinary(TransactionPlanSchema, txPlan),
  );
  return fromBinary(AuthorizationDataSchema, result);
};

export const getWitness = (txPlan: TransactionPlan, sct: StateCommitmentTree): WitnessData => {
  const result = witness(toBinary(TransactionPlanSchema, txPlan), sct);
  return fromBinary(WitnessDataSchema, result);
};

export const buildParallel = (
  batchActions: Action[],
  txPlan: TransactionPlan,
  witnessData: WitnessData,
  authData: AuthorizationData,
): Transaction => {
  const result = build_parallel(
    batchActions.map(action => toJson(ActionSchema, action)),
    toBinary(TransactionPlanSchema, txPlan),
    toBinary(WitnessDataSchema, witnessData),
    toBinary(AuthorizationDataSchema, authData),
  );
  return fromBinary(TransactionSchema, result);
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
    toBinary(TransactionPlanSchema, txPlan),
    toBinary(ActionPlanSchema, actionPlan),
    toBinary(FullViewingKeySchema, fullViewingKey),
    toBinary(WitnessDataSchema, witnessData),
  );

  return fromBinary(ActionSchema, result);
};

const loadProvingKey = async (
  actionType: Exclude<Action['action']['case'], undefined>,
  keyPath: string,
) => {
  const key = new Uint8Array(await (await fetch(keyPath)).arrayBuffer());
  load_proving_key(key, actionType);
};
