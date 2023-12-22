import {
  Action,
  TransactionPlan,
  WitnessData,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { JsonValue } from '@bufbuild/protobuf';

interface WasmTaskInput {
  transactionPlan: JsonValue;
  witness: JsonValue;
  fullViewingKey: string;
  actionId: number;
}

const workerListener = ({ data }: { data: WasmTaskInput }) => {
  const {
    transactionPlan: transactionPlanJson,
    witness: witnessJson,
    fullViewingKey,
    actionId,
  } = data;

  // Deserialize payload
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
  const actionKey = transactionPlan.actions[actionId]?.action.case;
  await penumbraWasmModule.loadProvingKey(actionKey!);

  // Build action according to specification in `TransactionPlan`
  const action = penumbraWasmModule.buildActionParallel(
    transactionPlan,
    witness,
    fullViewingKey,
    actionId,
  );

  return action;
}
