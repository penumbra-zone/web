import {
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
  load_proving_key as wasmLoadProvingKey,
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

const githubSourceDir =
  'https://github.com/penumbra-zone/penumbra/raw/main/crates/crypto/proof-params/src/gen/';

const provingKeys = [
  { keyType: 'spend', file: 'spend_pk.bin' },
  { keyType: 'output', file: 'output_pk.bin' },
  { keyType: 'swap', file: 'swap_pk.bin' },
  { keyType: 'swap_claim', file: 'swapclaim_pk.bin' },
  { keyType: 'nullifier_derivation', file: 'nullifier_derivation_pk.bin' },
  { keyType: 'delegator_vote', file: 'delegator_vote_pk.bin' },
  { keyType: 'undelegate_claim', file: 'undelegateclaim_pk.bin' },
];

const loadProvingKeys = async () => {
  for (const { file, keyType } of provingKeys) {
    const response = await fetch(`${githubSourceDir}${file}`);
    if (!response.ok) throw new Error(`Failed to fetch ${file}`);

    const buffer = await response.arrayBuffer();
    wasmLoadProvingKey(buffer, keyType);
  }
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
