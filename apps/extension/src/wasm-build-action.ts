import {
  Action,
  TransactionPlan,
  WitnessData,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import type { JsonValue } from '@bufbuild/protobuf';
import type { ActionBuildRequest } from '@penumbra-zone/types/src/internal-msg/offscreen';
import { FullViewingKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

import actionKeys from '@penumbra-zone/keys';
const keyFileNames: Partial<Record<Exclude<Action['action']['case'], undefined>, URL>> =
  Object.fromEntries(
    Object.entries(actionKeys).map(([action, keyFile]) => [
      action,
      new URL('keys/' + keyFile, PRAX_ORIGIN),
    ]),
  );

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
    fullViewingKey: fullViewingKeyJson,
    actionPlanIndex,
  } = data;

  // Deserialize payload
  const transactionPlan = TransactionPlan.fromJson(transactionPlanJson);
  const witness = WitnessData.fromJson(witnessJson);
  const fullViewingKey = FullViewingKey.fromJson(fullViewingKeyJson);

  void executeWorker(transactionPlan, witness, fullViewingKey, actionPlanIndex).then(
    self.postMessage,
  );
};

self.addEventListener('message', workerListener, { once: true });

async function executeWorker(
  transactionPlan: TransactionPlan,
  witness: WitnessData,
  fullViewingKey: FullViewingKey,
  actionPlanIndex: number,
): Promise<JsonValue> {
  // Dynamically load wasm module
  const penumbraWasmModule = await import('@penumbra-zone/wasm/build');

  const actionType = transactionPlan.actions[actionPlanIndex]!.action.case!;

  // Build action according to specification in `TransactionPlan`
  const action = await penumbraWasmModule.buildActionParallel(
    transactionPlan,
    witness,
    fullViewingKey,
    actionPlanIndex,
    keyFileNames[actionType]?.href,
  );

  return action.toJson();
}
