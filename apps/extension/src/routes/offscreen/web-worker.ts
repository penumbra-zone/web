import { JsonValue } from '@bufbuild/protobuf';
import { Action } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { WebWorkerMessagePayload } from './types';

self.addEventListener(
  'message',
  function (e: MessageEvent<{ type: string; data: WebWorkerMessagePayload }>) {
    const { type, data } = e.data;
    if (type === 'worker') {
      // Execute worker function using the fields
      execute_worker(
        data.transactionPlan,
        data.actionPlan,
        data.witness,
        data.fullViewingKey,
        data.key_type,
      )
        .then(action => {
          // Post message back to offscreen document
          self.postMessage(action);

          // Terminate worker
          close();
        })
        .catch(() => {
          throw new Error('Error in worker');
        });
    }
  },
);

async function execute_worker(
  transactionPlan: JsonValue,
  actionPlan: JsonValue,
  witness: JsonValue,
  fullViewingKey: string,
  key_type: string,
): Promise<Action> {
  console.log('web worker running...');

  // Dynamically load wasm module
  const penumbraWasmModule = await import('@penumbra-zone/wasm-bundler');

  // Conditionally read proving keys from disk and load keys into WASM binary
  switch (key_type) {
    case 'spend': {
      const spendKey = await loadLocalBinary('spend_pk.bin');
      penumbraWasmModule.load_proving_key(spendKey, 'spend');
      break;
    }
    case 'output': {
      const outputKey = await loadLocalBinary('output_pk.bin');
      penumbraWasmModule.load_proving_key(outputKey, 'output');
      break;
    }
    case 'delegatorVote': {
      const delegatorKey = await loadLocalBinary('delegator_vote_pk.bin');
      penumbraWasmModule.load_proving_key(delegatorKey, 'delegator_vote');
      break;
    }
    case 'swap': {
      const swapKey = await loadLocalBinary('swap_pk.bin');
      penumbraWasmModule.load_proving_key(swapKey, 'swap');
      break;
    }
    case 'swapClaim': {
      const swapClaimKey = await loadLocalBinary('swapclaim_pk.bin');
      penumbraWasmModule.load_proving_key(swapClaimKey, 'swap_claim');
      break;
    }
    case 'UndelegateClaim': {
      const undelegateClaimKey = await loadLocalBinary('undelegateclaim_pk.bin');
      penumbraWasmModule.load_proving_key(undelegateClaimKey, 'undelegate_claim');
      break;
    }
  }

  // Build specific action according to specificaton in transaction plan
  const action: Action = penumbraWasmModule.build_action(
    transactionPlan,
    actionPlan,
    fullViewingKey,
    witness,
  ) as Action;

  return action;
}

const loadLocalBinary = async (filename: string) => {
  const response = await fetch(`bin/${filename}`);
  if (!response.ok) throw new Error(`Failed to load ${filename}`);

  return await response.arrayBuffer();
};
