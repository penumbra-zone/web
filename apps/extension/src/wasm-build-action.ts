import {
  TransactionPlan,
  WitnessData,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import type { ActionBuildRequest } from '@penumbra-zone/types/src/internal-msg/offscreen';
import type { JsonValue } from '@bufbuild/protobuf';
import { camelToSnakeCase } from '@penumbra-zone/types/src/utility';
import { provingKeys } from '@penumbra-zone/types/src/proving-keys';

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

type ActionType = Exclude<TransactionPlan['actions'][number]['action']['case'], undefined>;

const actionTypeRequiresProvingKey = (actionType: ActionType) =>
  provingKeys.some(provingKey => provingKey.keyType === camelToSnakeCase(actionType));

async function executeWorker(
  transactionPlan: TransactionPlan,
  witness: WitnessData,
  fullViewingKey: string,
  actionPlanIndex: number,
): Promise<JsonValue> {
  // Dynamically load wasm module
  const penumbraWasmModule = await import('@penumbra-zone/wasm');

  // Conditionally read proving keys from disk and load keys into WASM binary
  const actionType = transactionPlan.actions[actionPlanIndex]?.action.case;
  if (!actionType) throw new Error('No action key provided');

  if (actionTypeRequiresProvingKey(actionType))
    await penumbraWasmModule.loadProvingKey(camelToSnakeCase(actionType));

  // Build action according to specification in `TransactionPlan`
  return penumbraWasmModule
    .buildActionParallel(transactionPlan, witness, fullViewingKey, actionPlanIndex)
    .toJson();
}
