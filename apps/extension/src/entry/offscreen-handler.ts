import { ConnectError } from '@connectrpc/connect';
import { errorToJson } from '@connectrpc/connect/protocol-connect';
import {
  ActionBuildRequest,
  ActionBuildResponse,
  isActionBuildRequest,
  isOffscreenRequest,
} from '@penumbra-zone/types/src/internal-msg/offscreen';

// propagates errors that occur in unawaited promises
// see: https://stackoverflow.com/questions/39992417/how-to-bubble-a-web-worker-error-in-a-promise-via-worker-onerror
const unhandledRejection = Promise.withResolvers<never>();
self.addEventListener(
  'unhandledrejection',
  event => {
    // the event object has two special properties:
    // event.promise - the promise that generated the error
    // event.reason  - the unhandled error object
    unhandledRejection.reject(event.reason);
  },
  { once: true },
);

chrome.runtime.onMessage.addListener((req, _sender, respond) => {
  if (!isOffscreenRequest(req)) return false;
  const { type, request } = req;
  if (isActionBuildRequest(request)) {
    void (async () => {
      try {
        const data = await Promise.race([
          spawnActionBuildWorker(request),
          // this error might not correspond to the specific request it responds to
          unhandledRejection.promise,
        ]);
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
  const { promise, resolve, reject } = Promise.withResolvers<ActionBuildResponse>();

  const worker = new Worker(new URL('../wasm-build-action.ts', import.meta.url));
  void promise.finally(() => worker.terminate());

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

  return promise;
};
