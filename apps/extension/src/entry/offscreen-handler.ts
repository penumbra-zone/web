import type { JsonValue } from '@bufbuild/protobuf';
import {
  ActionBuildRequest,
  isActionBuildRequest,
  isOffscreenRequest,
} from '@penumbra-zone/types/src/internal-msg/offscreen';

chrome.runtime.onMessage.addListener((req, _sender, respond) => {
  if (!isOffscreenRequest(req)) return false;
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
      respond(res);
    })();
  }
  return true;
});

const spawnWorker = (req: ActionBuildRequest): Promise<JsonValue> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../wasm-build-action.ts', import.meta.url));

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
