import type { JsonValue } from '@bufbuild/protobuf';
import { OffscreenRequest } from '@penumbra-zone/types/src/internal-msg/offscreen-types';

export const isOffscreenRequest = (req: unknown): req is OffscreenRequest =>
  req != null && typeof req === 'object' && 'type' in req && typeof req.type === 'string' && req.type === 'BUILD_ACTION'

export const offscreenMessageHandler = (
  req: unknown,
  _: chrome.runtime.MessageSender,
  sendResponse: (x: JsonValue) => void,
) => {
  if (!isOffscreenRequest(req)) return false;

  buildActionHandler(req, sendResponse);
  return true;
};

chrome.runtime.onMessage.addListener(offscreenMessageHandler);

export const buildActionHandler = (
  jsonReq: OffscreenRequest,
  responder: (r: JsonValue) => void,
) => {
  // Destructure the data object to get individual fields
  const { transactionPlan, witness, fullViewingKey } = jsonReq.request;

  // const actionCount = Object.entries(transactionPlan.actions).length;
  const workerPromises: Promise<JsonValue>[] = [];
  
  // Spawn web workers
  for (let i = 0; i < 4; i++) {
    workerPromises.push(spawnWorker(transactionPlan, witness, fullViewingKey, i));
  }

  // Wait for promises to resolve and construct response format
  void Promise.all(workerPromises).then(batchActions => {
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
    const worker = new Worker(new URL('./web-worker.ts', import.meta.url));

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
