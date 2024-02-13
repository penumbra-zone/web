import type { JsonValue } from '@bufbuild/protobuf';
import {
  OffscreenRequest,
  ActionBuildRequest,
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
      const response = spawnWorker(request);
      const res = await response
        .then(data => ({ type, data }))
        .catch((e: Error) => ({
          type,
          error: `Offscreen: ${e.message}`,
        }));
      sendResponse(res);
    })();
  }
  return true;
};

chrome.runtime.onMessage.addListener(offscreenMessageHandler);

const spawnWorker = (req: ActionBuildRequest): Promise<JsonValue> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./wasm-build-action.ts', import.meta.url));

    const onWorkerMessage = (e: MessageEvent) => {
      resolve(e.data as JsonValue);
      worker.removeEventListener('error', onWorkerError);
      worker.terminate();
    };

    const onWorkerError = (ev: ErrorEvent) => {
      const { filename, lineno, colno, message } = ev;
      reject(
        ev.error instanceof Error
          ? ev.error
          : new Error(`Worker ErrorEvent ${filename}:${lineno}:${colno} ${message}`),
      );
      worker.removeEventListener('message', onWorkerMessage);
      worker.terminate();
    };

    worker.addEventListener('message', onWorkerMessage, { once: true });
    worker.addEventListener('error', onWorkerError, { once: true });

    // Send data to web worker
    worker.postMessage(req);
  });
};
