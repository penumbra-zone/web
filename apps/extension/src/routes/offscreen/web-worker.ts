import {
  Action,
  ActionPlan,
  TransactionPlan,
  WitnessData,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { WebWorkerMessagePayload } from './types';

self.addEventListener(
  'message',
  function (e: MessageEvent<{ type: string; data: WebWorkerMessagePayload }>) {
    const { type, data } = e.data;
    if (type === 'worker') {
      execute_worker(
        data.transactionPlan,
        data.actionPlan,
        data.witness,
        data.fullViewingKey,
        data.keyType,
      )
        .then(action => {
          // Post message back to offscreen document
          self.postMessage(action);
        })
        .catch(() => {
          throw new Error('Error in worker');
        });
    }
  },
);

async function execute_worker(
  transactionPlan: TransactionPlan,
  actionPlan: ActionPlan,
  witness: WitnessData,
  fullViewingKey: string,
  keyType: string,
): Promise<Action> {
  console.log('web worker running...');

  // Dynamically load wasm module
  const penumbraWasmModule = await import('@penumbra-zone/wasm-ts');

  // Conditionally read proving keys from disk and load keys into WASM binary
  switch (keyType) {
    case 'spend': {
      await penumbraWasmModule.loadProvingKey('spend_pk.bin', 'spend');
      break;
    }
    case 'output': {
      await penumbraWasmModule.loadProvingKey('output_pk.bin', 'output');
      break;
    }
    case 'delegatorVote': {
      await penumbraWasmModule.loadProvingKey('delegator_vote_pk.bin', 'delegator_vote');
      break;
    }
    case 'swap': {
      await penumbraWasmModule.loadProvingKey('swap_pk.bin', 'swap');
      break;
    }
    case 'swapClaim': {
      await penumbraWasmModule.loadProvingKey('swapclaim_pk.bin', 'swap_claim');
      break;
    }
    case 'UndelegateClaim': {
      await penumbraWasmModule.loadProvingKey('undelegateclaim_pk.bin', 'undelegate_claim');
      break;
    }
  }

  const action = penumbraWasmModule.buildActionParallel(
    transactionPlan,
    actionPlan,
    witness,
    fullViewingKey,
  );

  return action;
}
