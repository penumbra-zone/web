import type { Action } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import {
  TransactionPlan,
  WitnessData,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { isWasmBuildActionInput } from '@penumbra-zone/types/src/internal-msg/offscreen';

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

const workerInputListener = (ev: MessageEvent<unknown>) => {
  if (ev.data && isWasmBuildActionInput(ev.data)) {
    const { transactionPlan, witness, fullViewingKey, actionPlanIndex } = ev.data;
    void executeWasmBuildAction(
      TransactionPlan.fromJson(transactionPlan),
      WitnessData.fromJson(witness),
      fullViewingKey,
      actionPlanIndex,
    ).then((builtAction: Action) => {
      self.postMessage(builtAction.toJson());
    });
  } else throw new Error('Unknown worker input');
};
self.addEventListener('message', workerInputListener, { once: true });

async function executeWasmBuildAction(
  transactionPlan: TransactionPlan,
  witness: WitnessData,
  fullViewingKey: string,
  actionPlanIndex: number,
): Promise<Action> {
  // Dynamically load wasm module
  const penumbraWasmModule = await import('@penumbra-zone/wasm-ts');

  // Conditionally read proving keys from disk and load keys into WASM binary
  const actionPlanType = transactionPlan.actions[actionPlanIndex]?.action.case;
  if (!actionPlanType) throw new Error('No action key provided');

  await penumbraWasmModule.loadProvingKey(actionPlanType);

  // Build action according to specification in `TransactionPlan`
  return penumbraWasmModule.buildActionParallel(
    transactionPlan,
    witness,
    fullViewingKey,
    actionPlanIndex,
  );
}
