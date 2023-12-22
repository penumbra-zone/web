import {
  Action,
  TransactionPlan,
  WitnessData,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { JsonValue } from '@bufbuild/protobuf/dist/esm';

interface WorkerMessagePayload {
  transactionPlan: JsonValue;
  witness: JsonValue;
  fullViewingKey: string;
  actionId: number;
}

const workerListener = ({ data }: { data: WorkerMessagePayload }) => {
  const {
    transactionPlan: transactionPlanJson,
    witness: witnessJson,
    fullViewingKey,
    actionId,
  } = data;

  const transactionPlan = TransactionPlan.fromJson(transactionPlanJson);
  const witness = WitnessData.fromJson(witnessJson);

  void executeWorker(transactionPlan, witness, fullViewingKey, actionId).then(action => {
    self.postMessage(action);
  });
};

self.addEventListener('message', workerListener);

async function executeWorker(
  transactionPlan: TransactionPlan,
  witness: WitnessData,
  fullViewingKey: string,
  actionId: number,
): Promise<Action> {
  console.log('web worker running...');

  // Dynamically load wasm module
  const penumbraWasmModule = await import('@penumbra-zone/wasm-ts');

  // Conditionally read proving keys from disk and load keys into WASM binary
  const actionKey = transactionPlan.actions[actionId]?.action.case; //?? Object.keys(transactionPlan.actions[actionId])[0];

  switch (actionKey) {
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
    default: {
      throw new Error('Unimplemented action type');
    }
  }

  const action = penumbraWasmModule.buildActionParallel(
    transactionPlan,
    witness,
    fullViewingKey,
    actionId,
  );

  return action;
}
