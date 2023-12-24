import {
  Action,
  TransactionPlan,
  WitnessData,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import type { WasmBuildActionInput } from '@penumbra-zone/types/src/internal-msg/offscreen';
import { Jsonified } from '@penumbra-zone/types/src/internal-msg/shared';

const workerListener = ({ data }: { data: WasmBuildActionInput }) => {
  const {
    transactionPlan: transactionPlanJson,
    witness: witnessJson,
    fullViewingKey,
    actionPlanIndex,
  } = data;

  // Deserialize payload
  const transactionPlan = TransactionPlan.fromJson(transactionPlanJson);
  const witness = WitnessData.fromJson(witnessJson);

  void executeWorker(transactionPlan, witness, fullViewingKey, actionPlanIndex).then(
    self.postMessage,
  );
};

self.addEventListener('message', workerListener);

async function executeWorker(
  transactionPlan: TransactionPlan,
  witness: WitnessData,
  fullViewingKey: string,
  actionPlanIndex: number,
): Promise<Jsonified<Action>> {
  // Dynamically load wasm module
  const penumbraWasmModule = await import('@penumbra-zone/wasm-ts');

  // Conditionally read proving keys from disk and load keys into WASM binary
  const actionPlanType = transactionPlan.actions[actionPlanIndex]?.action.case;
  if (!actionPlanType) throw new Error('No action key provided');

  await penumbraWasmModule.loadProvingKey(actionPlanType);

  // Build action according to specification in `TransactionPlan`
  return penumbraWasmModule
    .buildActionParallel(transactionPlan, witness, fullViewingKey, actionPlanIndex)
    .toJson();
}
