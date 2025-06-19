import {
  scheduleProveJobShamir,
  verifyProofResultSignature,
} from '@penumbra-zone/wasm/delegated_proving';
import {
  ConfigurationParameters,
  Configuration,
  BlueprintApi,
  JobApi,
  JobStatus,
  NpsKeyMaterial,
  ProofResult,
} from '@taceo/proof-api-client';

const API_URL = 'https://trout.taceo.network';
const BLUEPRINT_ID = 'a6979c1d-f6e0-44fe-9edd-707afa6117d5';

const configParams: ConfigurationParameters = {
  basePath: API_URL,
};
const configuration = new Configuration(configParams);
const jobInstance = new JobApi(configuration);
const blueprintInstance = new BlueprintApi(configuration);

export const pollProofResult = async (
  jobId: string,
  keyMaterial: NpsKeyMaterial[],
): Promise<ProofResult | null> => {
  while (true) {
    try {
      const jobResults = await jobInstance.getResults({ id: jobId });
      if (jobResults.result0.status == JobStatus.Success && jobResults.result0.signature != null) {
        const proofResult = jobResults.result0.ok!;
        try {
          verifyProofResultSignature(
            jobId,
            proofResult,
            jobResults.result0.signature,
            keyMaterial[0]!,
          );
        } catch (e) {
          return null;
        }
        return proofResult;
      } else if (jobResults.result0.status == JobStatus.Failed) {
        return null;
      }
    } catch (error) {
      console.error('error:', error);
      return null;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
};

export const scheduleDelegatedProof = async (
  witnesses: Uint8Array[],
  public_inputs: number[],
): Promise<void> => {
  if (witnesses.length !== public_inputs.length) {
    throw new Error('Mismatched witness and public input arrays');
  }

  const keyMaterial = await blueprintInstance.blueprintKeyMaterial({ id: BLUEPRINT_ID });

  // Launch all proof jobs in parallel
  await Promise.all(
    witnesses.map(async (witness, i) => {
      const jobId = await scheduleProveJobShamir(
        jobInstance,
        BLUEPRINT_ID,
        keyMaterial,
        public_inputs[i]!,
        witness,
      );
      await pollProofResult(jobId, keyMaterial);
    }),
  );
};
