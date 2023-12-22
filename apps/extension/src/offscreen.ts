import type { JsonValue, JsonObject } from '@bufbuild/protobuf';

console.log('offscreen.ts');

interface OffscreenRequest {
  offscreen: 'BUILD_ACTION';
  transactionPlan: UnknownTransactionPlan;
  witness: JsonValue;
  fullViewingKey: string;
}

type ActionName = 'spend' | 'output' | 'delegatorVote' | 'swap' | 'swapClaim';

//type UnknownAction = Pick<{ [k in ActionName]: JsonObject }, ActionName>
type UnknownAction = Pick<{ [k in ActionName]: JsonObject }, ActionName>;
type UnknownTransactionPlan = JsonObject & { actions: UnknownAction[] };

const isOffscreenRequest = (req: unknown): req is OffscreenRequest =>
  typeof req === 'object' && req != null && 'offscreen' in req && req.offscreen === 'BUILD_ACTION';

export const offscreenMessageHandler = (
  req: unknown,
  _: chrome.runtime.MessageSender,
  sendResponse: (x: JsonValue) => void,
) => {
  if (!isOffscreenRequest(req)) {
    console.log('offscreenMessageHandler, nope', req);
    return;
  }
  console.log('offscreenMessageHandler, yep', req);

  buildActionHandler(req, sendResponse);
  return true;
};

chrome.runtime.onMessage.addListener(offscreenMessageHandler);

export const buildActionHandler = (
  jsonReq: OffscreenRequest,
  responder: (r: JsonValue) => void,
) => {
  console.log('buildActionHandler', jsonReq);
  // Destructure the data object to get individual fields
  const { transactionPlan, witness, fullViewingKey } = jsonReq;

  const actionCount = Object.entries(transactionPlan.actions).length;
  const workerPromises: Promise<JsonValue>[] = [];
  // Spawn web workers
  for (let i = 0; i < actionCount; i++) {
    workerPromises.push(spawnWorker(transactionPlan, witness, fullViewingKey, i));
  }

  // Wait for promises to resolve and construct response format
  void Promise.all(workerPromises).then(batchActions => {
    console.log('got batch of actions', batchActions);
    responder({
      type: 'BUILD_ACTION',
      data: batchActions,
    });
  });
};

const spawnWorker = (
  transactionPlan: JsonValue,
  witness: JsonValue,
  fullViewingKey: string,
  actionId: number,
): Promise<JsonValue> => {
  return new Promise((resolve, reject) => {
    console.log('spawning worker');
    const worker = new Worker(new URL('./web-worker.ts', import.meta.url));
    console.log('spawned', worker);

    const onWorkerMessage = (e: MessageEvent) => {
      resolve(e.data as JsonValue);
      worker.removeEventListener('message', onWorkerMessage);
      worker.removeEventListener('message', onWorkerError);
      worker.terminate();
    };

    const onWorkerError = (error: unknown) => {
      reject(error);
      worker.removeEventListener('message', onWorkerMessage);
      worker.removeEventListener('message', onWorkerError);
      worker.terminate();
    };

    worker.addEventListener('message', onWorkerMessage);
    worker.addEventListener('error', onWorkerError);

    // Send data to web worker
    worker.postMessage({
      transactionPlan,
      witness,
      fullViewingKey,
      actionId,
    });
  });
};
