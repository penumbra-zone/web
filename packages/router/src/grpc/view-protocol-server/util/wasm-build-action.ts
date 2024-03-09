import {
  TransactionPlan,
  WitnessData,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { isActionBuildRequestMessageEvent } from './worker-message';
import { buildAction } from '@penumbra-zone/wasm/src/build';

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

self.addEventListener(
  'message',
  (evt: MessageEvent<unknown>) => {
    if (!isActionBuildRequestMessageEvent(evt)) throw new Error('Unknown worker message event');
    const { transactionPlan, witness, fullViewingKey, actionPlanIndex } = evt.data;
    void buildAction(
      TransactionPlan.fromJson(transactionPlan),
      WitnessData.fromJson(witness),
      fullViewingKey,
      actionPlanIndex,
    ).then(action => self.postMessage(action.toJson()));
  },
  { once: true },
);
