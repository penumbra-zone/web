import { ConnectError } from '@connectrpc/connect';
import { errorToJson } from '@connectrpc/connect/protocol-connect';
import {
  ActionBuildRequest,
  ActionBuildResponse,
  isActionBuildRequest,
  isOffscreenRequest,
} from '@penumbra-zone/types/internal-msg/offscreen';

chrome.runtime.onMessage.addListener((req, _sender, respond) => {
  if (!isOffscreenRequest(req)) return false;
  const { type, request } = req;
  if (isActionBuildRequest(request)) {
    void (async () => {
      try {
        // propagate errors that occur in unawaited promises
        const unhandled = Promise.withResolvers<never>();
        self.addEventListener('unhandledrejection', unhandled.reject, {
          once: true,
        });

        const data = await Promise.race([
          spawnActionBuildWorker(request),
          unhandled.promise,
        ]).finally(() => self.removeEventListener('unhandledrejection', unhandled.reject));

        respond({ type, data });
      } catch (e) {
        const error = errorToJson(
          // note that any given promise rejection event probably doesn't
          // actually involve the specific request it ends up responding to.
          ConnectError.from(e instanceof PromiseRejectionEvent ? e.reason : e),
          undefined,
        );
        respond({ type, error });
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
