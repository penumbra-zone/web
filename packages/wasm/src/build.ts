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

export async function fetchBinaryFile(filename: string) {
  const response = await fetch(`bin/${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${filename}`);
  }

  return await response.arrayBuffer();
}

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
  // Read proving keys from disk
  const delegatorKey = await fetchBinaryFile('delegator_vote_pk.bin');
  const nullifierKey = await fetchBinaryFile('nullifier_derivation_pk.bin');
  const outputKey = await fetchBinaryFile('output_pk.bin');
  const spendKey = await fetchBinaryFile('spend_pk.bin');
  const swapKey = await fetchBinaryFile('swap_pk.bin');
  const swapClaimKey = await fetchBinaryFile('swapclaim_pk.bin');
  const undelegateClaimKey = await fetchBinaryFile('undelegateclaim_pk.bin');

  // Load and set keys into WASM binary
  wasmLoadProvingKey(spendKey, "spend");
  wasmLoadProvingKey(outputKey, "output");
  wasmLoadProvingKey(delegatorKey, "delegator_vote");
  wasmLoadProvingKey(nullifierKey, "nullifier_derivation");
  wasmLoadProvingKey(swapKey, "swap");
  wasmLoadProvingKey(swapClaimKey, "swap_claim");
  wasmLoadProvingKey(undelegateClaimKey, "undelegate_claim");

  const result = validateSchema(
    WasmBuildSchema,
    wasmBuild(fullViewingKey, txPlan.toJson(), witnessData.toJson(), authData.toJson()),
  );
  return Transaction.fromJsonString(JSON.stringify(result));
};
