import {
  ActionPlan,
  TransactionPlan,
  WitnessData,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import type { JsonObject, JsonValue } from '@bufbuild/protobuf';
import { FullViewingKey } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import keyPaths from '@penumbra-zone/keys';

export interface WorkerBuildAction {
  transactionPlan: JsonObject;
  witness: JsonObject;
  fullViewingKey: JsonObject;
  actionPlanIndex: number;
}

interface ExecuteWorkerParams {
  transactionPlan: TransactionPlan;
  witness: WitnessData;
  fullViewingKey: FullViewingKey;
  actionPlanIndex: number;
}

// necessary to propagate errors that occur in promises
// see: https://stackoverflow.com/questions/39992417/how-to-bubble-a-web-worker-error-in-a-promise-via-worker-onerror
globalThis.addEventListener(
  'unhandledrejection',
  event => {
    // the event object has two special properties:
    // event.promise - the promise that generated the error
    // event.reason  - the unhandled error object
    throw event.reason;
  },
  { once: true },
);

const workerListener = ({ data }: MessageEvent<WorkerBuildAction>) => {
  console.debug('workerListener', data);
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

  void executeWorker({ transactionPlan, witness, fullViewingKey, actionPlanIndex }).then(
    jsonAction => {
      console.debug('built action', jsonAction);
      globalThis.postMessage(jsonAction);
    },
  );
};

globalThis.addEventListener('message', workerListener, { once: true });

const executeWorker = async ({
  transactionPlan,
  witness,
  fullViewingKey,
  actionPlanIndex,
}: ExecuteWorkerParams): Promise<JsonValue> => {
  console.debug('executeWorker', transactionPlan, witness, fullViewingKey, actionPlanIndex);
  // Dynamically load wasm module
  const penumbraWasmModule = await import('@penumbra-zone/wasm/build');

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- asdf
  const actionType = transactionPlan.actions[actionPlanIndex]!.action.case!;

  type KeyPaths = Partial<Record<NonNullable<ActionPlan['action']['case']>, URL>>;
  const keyPath = (keyPaths as KeyPaths)[actionType];

  console.debug('build-action-worker using keyPath', keyPath);

  // Build action according to specification in `TransactionPlan`
  const action = await penumbraWasmModule.buildActionParallel(
    transactionPlan,
    witness,
    fullViewingKey,
    actionPlanIndex,
    keyPath?.href,
  );

  console.debug('built action', action.toJson());

  return action.toJson();
};
