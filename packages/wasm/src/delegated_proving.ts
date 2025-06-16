import { seal_share, split_input_rep3_bls12_377, split_witness_rep3_bls12_377, split_witness_shamir_bls12_377, verify_proof_result_signature } from "../wasm/index.js";
import { JobApi, JobType, NpsKeyMaterial, ProofResult } from '@taceo/proof-api-client';

async function scheduleJob(
  apiInstance: JobApi,
  blueprintId: string,
  jobType: JobType,
  code: string | null,
  shares: Uint8Array[],
  keyMaterial: NpsKeyMaterial[],
): Promise<string> {
  const share0Ciphertext = seal_share(keyMaterial[0]!.encKey, shares[0]!);
  const share1Ciphertext = seal_share(keyMaterial[1]!.encKey, shares[1]!);
  const share2Ciphertext = seal_share(keyMaterial[2]!.encKey, shares[2]!);

  const scheduleJobResponse = await apiInstance.scheduleJob({
    aBlueprintId: blueprintId,
    bJobType: jobType,
    cCode: code,
    inputParty0: new Blob([share0Ciphertext]),
    inputParty1: new Blob([share1Ciphertext]),
    inputParty2: new Blob([share2Ciphertext])
  });

  return scheduleJobResponse.jobId;
}

/**
 * Verify the signature of a proof result. Throws an error if the signature cannot be verified.
 */
export function verifyProofResultSignature(jobId: string, proofResult: ProofResult, signature: string,
  npsKeyMaterial: NpsKeyMaterial) {
  verify_proof_result_signature(jobId, proofResult.proof, proofResult.publicInputs, npsKeyMaterial.verifyKey, signature)
}

/**
 * Schedule a full job including witness extension. The retuned job id can be used to query the job status.
 */
export async function scheduleFullJobRep3(
  apiInstance: JobApi,
  blueprintId: string,
  code: string | null,
  keyMaterial: NpsKeyMaterial[],
  public_inputs: string[],
  input: any
): Promise<string> {
  let sharedInput;
  sharedInput = split_input_rep3_bls12_377(input, public_inputs);

  const shares = [sharedInput.shares0, sharedInput.shares1, sharedInput.shares2];
  return await scheduleJob(apiInstance, blueprintId, JobType.Rep3Full, code, shares, keyMaterial);
}

/**
 * Schedule a Rep3 prove job. The retuned job id can be used to query the job status.
 */
export async function scheduleProveJobRep3(
  apiInstance: JobApi,
  blueprintId: string,
  code: string | null,
  keyMaterial: NpsKeyMaterial[],
  num_pub_inputs: number,
  witness: Uint8Array
): Promise<string> {
  let sharedInput;
  sharedInput = split_witness_rep3_bls12_377(witness, num_pub_inputs);

  const shares = [sharedInput.shares0, sharedInput.shares1, sharedInput.shares2];
  return await scheduleJob(apiInstance, blueprintId, JobType.Rep3Prove, code, shares, keyMaterial);
}

/**
 * Schedule a Shamir prove job. The retuned job id can be used to query the job status.
 */
export async function scheduleProveJobShamir(apiInstance: JobApi,
  blueprintId: string,
  code: string | null,
  keyMaterial: NpsKeyMaterial[],
  num_pub_inputs: number,
  witness: Uint8Array
): Promise<string> {
  let sharedInput;
  sharedInput = split_witness_shamir_bls12_377(witness, num_pub_inputs);

  const shares = [sharedInput.shares0, sharedInput.shares1, sharedInput.shares2];
  return await scheduleJob(apiInstance, blueprintId, JobType.ShamirProve, code, shares, keyMaterial);
}