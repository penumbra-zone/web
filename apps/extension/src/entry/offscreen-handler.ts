import { ConnectError } from '@connectrpc/connect';
import { errorToJson } from '@connectrpc/connect/protocol-connect';
import {
  ActionBuildRequest,
  ActionBuildResponse,
  isActionBuildRequest,
  isOffscreenRequest,
} from '@penumbra-zone/types/src/internal-msg/offscreen';

chrome.runtime.onMessage.addListener((req, _sender, respond) => {
  if (!isOffscreenRequest(req)) return false;
  const { type, request } = req;
  if (isActionBuildRequest(request)) {
    void (async () => {
      try {
        const data = await spawnActionBuildWorker(request);
        respond({ type, data });
      } catch (e) {
        respond({
          type,
          error: errorToJson(ConnectError.from(e), undefined),
        });
      }
    })();
    return true;
  }
  return false;
});

const spawnActionBuildWorker = (req: ActionBuildRequest) => {
  const worker = new Worker(new URL('../wasm-build-action.ts', import.meta.url));
  return new Promise<ActionBuildResponse>((resolve, reject) => {
    const onWorkerMessage = (e: MessageEvent) => resolve(e.data as ActionBuildResponse);

    const onWorkerError = ({ error, filename, lineno, colno, message }: ErrorEvent) =>
      reject(
        error instanceof Error
          ? error
          : new Error(`Worker ErrorEvent ${filename}:${lineno}:${colno} ${message}`),
      );

    const onWorkerMessageError = (ev: MessageEvent) => reject(ConnectError.from(ev.data ?? ev));

    worker.addEventListener('message', onWorkerMessage, { once: true });
    worker.addEventListener('error', onWorkerError, { once: true });
    worker.addEventListener('messageerror', onWorkerMessageError, { once: true });

    // Send data to web worker
    worker.postMessage(req);
  }).finally(() => worker.terminate());
};
