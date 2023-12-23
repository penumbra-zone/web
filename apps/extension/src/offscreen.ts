import type { JsonValue } from '@bufbuild/protobuf';
import { JsonObject } from '@bufbuild/protobuf/dist/esm';
import {
  OffscreenRequest,
  ActionBuildRequest,
  WasmTaskInput,
  isActionBuildRequest,
} from '@penumbra-zone/types/src/internal-msg/offscreen';

export const isOffscreenRequest = (req: unknown): req is OffscreenRequest =>
  req != null &&
  typeof req === 'object' &&
  'type' in req &&
  typeof req.type === 'string' &&
  req.type === 'BUILD_ACTION';

export const offscreenMessageHandler = (
  req: unknown,
  _: chrome.runtime.MessageSender,
  sendResponse: (x: JsonValue) => void,
) => {
  if (!isOffscreenRequest(req)) return;
  if (isActionBuildRequest(req.request)) {
    const { type, request } = req;
    void (async () => {
      const response = Promise.all(buildActionHandler(request));
      const res = await response
        .then(data => ({ type, data }))
        .catch(e => ({ type, error: String(e) }));
      sendResponse(res);
    })();
  }
  return true;
};

chrome.runtime.onMessage.addListener(offscreenMessageHandler);

export const buildActionHandler = (request: ActionBuildRequest) => {
  // Destructure the data object to get individual fields
  const { transactionPlan, witness, fullViewingKey } = request;

  return transactionPlan.actions.map((_, i) =>
    spawnWorker(transactionPlan, witness, fullViewingKey, i),
  );
};

const spawnWorker = (
  transactionPlan: JsonObject & { actions: JsonValue[] },
  witness: JsonObject,
  fullViewingKey: string,
  actionPlanIndex: number,
): Promise<JsonValue> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./wasm-task.ts', import.meta.url));

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
      actionPlanIndex,
    } satisfies WasmTaskInput);
  });
};
