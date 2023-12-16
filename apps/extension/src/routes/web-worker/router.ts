import { JsonValue } from "@bufbuild/protobuf";
import { loadLocalBinary } from "./utils";
import { Action } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb";

self.addEventListener('message', async function(e) {
    const { type, data } = e.data;
    if (type === 'worker') {                       
        // Execute worker function using the fields
        const action = await execute_worker(data.transactionPlan, data.actionPlan, data.witness, data.fullViewingKey, data.key_type);

        // Post message back to offscreen document
        self.postMessage(action);
    }
}, false);

async function execute_worker(
    transactionPlan: JsonValue, 
    actionPlan: JsonValue, 
    witness: JsonValue, 
    fullViewingKey: string, 
    key_type: string
) {
    console.log('web worker running...');

    // Dynamically load wasm module
    const penumbraWasmModule = await import('@penumbra-zone/wasm-bundler');

    // Conditionally read proving keys from disk and load keys into WASM binary
    switch(key_type) {
        case "spend":
            const spendKey = await loadLocalBinary('spend_pk.bin');
            penumbraWasmModule.load_proving_key(spendKey, "spend");
            break;
        case "output":
            const outputKey = await loadLocalBinary('output_pk.bin');
            penumbraWasmModule.load_proving_key(outputKey, "output");
            break;
        case "delegatorVote":
            const delegatorKey = await loadLocalBinary('delegator_vote_pk.bin');
            penumbraWasmModule.load_proving_key(delegatorKey, "delegator_vote");
            break;
        case "swap":
            const swapKey = await loadLocalBinary('swap_pk.bin');
            penumbraWasmModule.load_proving_key(swapKey, "swap");
            break;
        case "swapClaim":
            const swapClaimKey = await loadLocalBinary('swapclaim_pk.bin');
            penumbraWasmModule.load_proving_key(swapClaimKey, "swap_claim");
            break;
         case "UndelegateClaim":
            const undelegateClaimKey = await loadLocalBinary('undelegateclaim_pk.bin');
            penumbraWasmModule.load_proving_key(undelegateClaimKey, "undelegate_claim");
            break;
    }

    // Build specific action according to specificaton in transaction plan
    const action: Action = penumbraWasmModule.build_action(transactionPlan, actionPlan, fullViewingKey, witness)

    return action;
}