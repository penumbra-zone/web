import { WitnessData } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb";
import { JsonValue } from "@bufbuild/protobuf";
import { loadProvingKeys } from "@penumbra-zone/wasm-ts/src/utils";

self.addEventListener('message', async function(e) {
    const { type, data } = e.data;

    if (type === 'worker') {                       
        // Destructure the data object to get individual fields
        const { witnessAndBuildRequest, witness, fullViewingKey } = data 

        // Execute worker function using the fields
        const action = await execute_worker(witnessAndBuildRequest, witness, fullViewingKey);

        // Post message back to offscreen document
        self.postMessage(JSON.stringify(action));
    }
}, false);

async function execute_worker(
    witnessAndBuildRequest: JsonValue, 
    witness: WitnessData, 
    fullViewingKey: string
) {
    console.log('web worker running...');

    // Fetch and load keys into WASM binary
    await loadProvingKeys();
}