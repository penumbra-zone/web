import { ConnectError } from '@connectrpc/connect';
import { errorToJson } from '@connectrpc/connect/protocol-connect';
import {
  ActionBuildRequest,
  ActionBuildResponse,
  isActionBuildRequest,
  isOffscreenRequest,
} from '@penumbra-zone/types/src/internal-msg/offscreen';

chrome.runtime.onMessage.addListener((req, _sender, respond) => {
  if (isOffscreenRequest(req)) {
    const { type, request } = req;
    if (isActionBuildRequest(request)) {
      void spawnActionBuildWorker(request)
        .then(
          data => ({ type, data }),
          e => ({
            type,
            error: errorToJson(ConnectError.from(e), undefined),
          }),
        )
        .then(respond);
      return true;
    }
  }
  return false;
});

const spawnActionBuildWorker = (req: ActionBuildRequest) => {
  const worker = new Worker(new URL('../wasm-build-action.ts', import.meta.url));
  return new Promise<ActionBuildResponse>((resolve, reject) => {
    worker.addEventListener(
      'message',
      (e: MessageEvent) => resolve(e.data as ActionBuildResponse),
      { once: true },
    );

    worker.addEventListener(
      'error',
      ({ error, filename, lineno, colno, message }: ErrorEvent) =>
        reject(
          error instanceof Error
            ? error
            : new Error(`Worker ErrorEvent ${filename}:${lineno}:${colno} ${message}`),
        ),
      { once: true },
    );

    worker.addEventListener(
      'messageerror',
      (ev: MessageEvent) => reject(ConnectError.from(ev.data ?? ev)),

      { once: true },
    );

    // Send data to web worker
    worker.postMessage(req);
  }).finally(() => worker.terminate());
};
