import {
  Action,
  AuthorizationData,
  Transaction,
  TransactionPlan,
  WitnessData,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import type { StateCommitmentTree } from '@penumbra-zone/types/src/state-commitment-tree';
import { authorize, build_action, build_parallel, load_proving_key, witness } from '../wasm';
import keyMap from '@penumbra-zone/keys';
import {
  FullViewingKey,
  SpendKey,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

type ActionType = Exclude<Action['action']['case'], undefined>;

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
): Promise<Action> => {
  // Conditionally read proving keys from disk and load keys into WASM binary
  const actionPlan = txPlan.actions[actionId];
  if (!actionPlan?.action.case) throw new Error('No action key provided');
  await loadProvingKey(actionPlan.action.case);

  const result = build_action(
    txPlan.toBinary(),
    actionPlan.toBinary(),
    fullViewingKey.toBinary(),
    witnessData.toBinary(),
  );

  return Action.fromBinary(result);
};

const loadProvingKey = async (actionType: ActionType) => {
  const keyType = (keyMap as Partial<Record<ActionType, string>>)[actionType];
  if (!keyType) return;

  // webpack doesn't provide import.meta.resolve. so we have to declare a type,
  // configure a matching loader in webpack config, import it so webpack can
  // identify the file as relevant, examine the transformed export to discover
  // the bundled asset path, and then fetch the binary.

  // if we were to use any indirection when constructing the import path,
  // webpack would not be able to identify the file as an asset and would not
  // bundle it.

  // eslint-disable-next-line no-restricted-syntax
  let keyImport;
  switch (actionType as keyof typeof keyMap) {
    case 'output':
      keyImport = await import('@penumbra-zone/keys/output_pk.bin');
      break;
    case 'spend':
      keyImport = await import('@penumbra-zone/keys/spend_pk.bin');
      break;
    case 'delegatorVote':
      keyImport = await import('@penumbra-zone/keys/delegator_vote_pk.bin');
      break;
    case 'swap':
      keyImport = await import('@penumbra-zone/keys/swap_pk.bin');
      break;
    case 'swapClaim':
      keyImport = await import('@penumbra-zone/keys/swapclaim_pk.bin');
      break;
    case 'undelegateClaim':
      keyImport = await import('@penumbra-zone/keys/convert_pk.bin');
      break;
    default:
      throw new Error('Invalid action type');
  }

  const keyFetch = fetch(keyImport.default);
  const keyBin = new Uint8Array(await (await keyFetch).arrayBuffer());

  load_proving_key(keyBin, keyType);
};
