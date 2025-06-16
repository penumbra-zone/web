import { scheduleProveJobShamir, verifyProofResultSignature } from '@penumbra-zone/wasm/delegated_proving';
import { ConfigurationParameters, Configuration, BlueprintApi, JobApi, JobStatus, NpsKeyMaterial, ProofResult } from '@taceo/proof-api-client';

const API_URL      = "https://proof-beta-us.taceo.network";             
const BLUEPRINT_ID = "243a009d-f0d8-4707-8f84-a1c0db703a6b";
const AUTH_CODE    = "msq2QUT/t3Txd3owK+rH/pOtCU5VK748yUZU9XFYooE="; 

const configParams: ConfigurationParameters = {
  basePath: API_URL,
}
const configuration = new Configuration(configParams);
const jobInstance = new JobApi(configuration);
const blueprintInstance = new BlueprintApi(configuration);

export const pollProofResult = async (jobId: string, keyMaterial: NpsKeyMaterial[]): Promise<ProofResult | null> => {
    console.log("entered pollProofResult!")
    while (true) {
        try {
        const jobResults = await jobInstance.getResults({ id: jobId });
        if (jobResults.result0.status == JobStatus.Success && jobResults.result0.signature != null) {
            const proofResult = jobResults.result0.ok!;
            try {
                verifyProofResultSignature(jobId, proofResult, jobResults.result0.signature, keyMaterial[0]!);
            } catch (e) {
                console.error("Signature verification failed:", e);
                return null;
            }
            return proofResult;
        } else if (jobResults.result0.status == JobStatus.Failed) {
            console.log("something went wrong!!!!!!!!!!!")
            return null;
        }
        } catch (error) {
        console.error('error:', error);
        return null;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
};

export const delegateProof = async (
  witnesses: Uint8Array[],
): Promise<void> => {
    console.log('entered delegateProof!')
    console.log('witnesses: ', witnesses)

    const keyMaterial = await blueprintInstance.blueprintKeyMaterial({id: BLUEPRINT_ID});
    console.log("keyMaterial: ", keyMaterial)

    const jobId = await scheduleProveJobShamir(
        jobInstance,
        BLUEPRINT_ID,
        AUTH_CODE,
        keyMaterial,
        4,
        witnesses[0]!,
  );

  console.log("Job scheduled:", jobId);

//   const finalStatus = await pollProofResult(jobId, keyMaterial);
//   console.log("finalStatus: ", finalStatus)
  
}


