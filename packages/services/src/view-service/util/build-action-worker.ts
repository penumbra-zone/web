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
onunhandledrejection = function (this, event) {
  console.debug('build-action-worker unhandledrejection', this, event);
  throw event.reason;
};

onmessage = function (this, event) {
  console.debug('build-action-worker onmessage', this, event);
  const { data } = event as MessageEvent<WorkerBuildAction>;
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

  void buildAction({ transactionPlan, witness, fullViewingKey, actionPlanIndex }).then(action =>
    postMessage(action.toJson()),
  );
};

const buildAction = async ({
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

  debugger;
  return action;
};
