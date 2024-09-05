import {
  type Action,
  type ActionPlan,
  TransactionPlan,
  WitnessData,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import type { JsonObject } from '@bufbuild/protobuf';
import { FullViewingKey } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import keyPaths from '@penumbra-zone/keys';

console.log('build-action-worker loaded');
console.log('keyPaths', keyPaths);

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
  console.debug('build-action-worker workerListener', data);
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

  console.debug('executing...');

  void executeWorker({ transactionPlan, witness, fullViewingKey, actionPlanIndex }).then(action =>
    globalThis.postMessage(action.toJson()),
  );
};

globalThis.addEventListener('message', workerListener, { once: true });

const executeWorker = async ({
  transactionPlan,
  witness,
  fullViewingKey,
  actionPlanIndex,
}: ExecuteWorkerParams): Promise<Action> => {
  console.debug(
    'build-action-worker executeWorker',
    transactionPlan,
    witness,
    fullViewingKey,
    actionPlanIndex,
  );
  // Dynamically load wasm module
  const penumbraWasmModule = await import('@penumbra-zone/wasm/build');

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- asdf
  const actionType = transactionPlan.actions[actionPlanIndex]!.action.case!;

  type KeyPaths = Partial<Record<NonNullable<ActionPlan['action']['case']>, URL>>;
  const keyPath = (keyPaths as KeyPaths)[actionType];

  console.debug('build-action-worker using keyPath', String(keyPath));

  // Build action according to specification in `TransactionPlan`
  const action = await penumbraWasmModule.buildActionParallel(
    transactionPlan,
    witness,
    fullViewingKey,
    actionPlanIndex,
    keyPath?.href,
  );

  console.debug('built action', action);

  return action;
};
