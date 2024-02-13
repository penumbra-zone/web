import {
  TransactionPlan,
  WitnessData,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import type { ActionBuildRequest } from '@penumbra-zone/types/src/internal-msg/offscreen';
import type { JsonValue } from '@bufbuild/protobuf';
import { camelToSnakeCase } from '@penumbra-zone/types/src/utility';

// necessary to propagate errors that occur in promises
// see: https://stackoverflow.com/questions/39992417/how-to-bubble-a-web-worker-error-in-a-promise-via-worker-onerror
self.addEventListener(
  'unhandledrejection',
  event => {
    // the event object has two special properties:
    // event.promise - the promise that generated the error
    // event.reason  - the unhandled error object
    throw event.reason;
  },
  { once: true },
);

const workerListener = ({ data }: { data: ActionBuildRequest }) => {
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

self.addEventListener('message', workerListener, { once: true });

async function executeWorker(
  transactionPlan: TransactionPlan,
  witness: WitnessData,
  fullViewingKey: string,
  actionPlanIndex: number,
): Promise<JsonValue> {
  // Dynamically load wasm module
  const penumbraWasmModule = await import('@penumbra-zone/wasm-ts');

  // Conditionally read proving keys from disk and load keys into WASM binary
  const actionPlanType = transactionPlan.actions[actionPlanIndex]?.action.case;
  if (!actionPlanType) throw new Error('No action key provided');

  await penumbraWasmModule.loadProvingKey(camelToSnakeCase(actionPlanType));

  // Build action according to specification in `TransactionPlan`
  return penumbraWasmModule
    .buildActionParallel(transactionPlan, witness, fullViewingKey, actionPlanIndex)
    .toJson();
}
