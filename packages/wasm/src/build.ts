import {
  Action,
  AuthorizationData,
  Transaction,
  TransactionPlan,
  WitnessData,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import type { StateCommitmentTree } from '@penumbra-zone/types/state-commitment-tree';
import {
  authorize,
  build_action,
  build_parallel,
  load_proving_key,
  witness,
} from '../wasm/index.js';
import { FullViewingKey, SpendKey } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

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
    // temporary workaround (normalize action casing)
    // TODO: remove after updating protos with proper naming convention
    const normalizedCase =
      actionPlan.action.case === 'actionLiquidityTournamentVotePlan'
        ? 'actionLiquidityTournamentVote'
        : actionPlan.action.case;

    await loadProvingKey(normalizedCase, keyPath);
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
