import type { JsonValue } from '@bufbuild/protobuf';
import { isJsonObject } from '@penumbra-zone/types';
import {
  OffscreenRequest,
  OffscreenResponse,
  ActionBuildRequest,
  ActionBuildResponse,
  WasmBuildActionInput,
  WasmBuildActionOutput,
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
  const { type, request } = req;
  if (isActionBuildRequest(request)) {
    void (async () => {
      const response = Promise.all(buildActionHandler(request));
      const res = await response
        .then((data: ActionBuildResponse) => ({ type, data }))
        .catch((e: Error) => ({
          type,
          error: `Offscreen: ${e.message}`,
        }));
      sendResponse(res satisfies OffscreenResponse);
    })();
    return true;
  } else throw new Error('Unknown offscreen request');
};

chrome.runtime.onMessage.addListener(offscreenMessageHandler);

export const buildActionHandler = (request: ActionBuildRequest) => {
  // Destructure the data object to get individual fields
  const { transactionPlan, witness, fullViewingKey } = request;

  return transactionPlan.actions.map((_, actionPlanIndex) =>
    spawnWorker({ transactionPlan, witness, fullViewingKey, actionPlanIndex }),
  );
};

const spawnWorker = ({
  transactionPlan,
  witness,
  fullViewingKey,
  actionPlanIndex,
}: WasmBuildActionInput): Promise<WasmBuildActionOutput> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./wasm-build-action.ts', import.meta.url));

    const onWorkerMessage = (e: MessageEvent<unknown>) => {
      worker.removeEventListener('error', onWorkerError);
      worker.terminate();
      if (isJsonObject(e.data)) resolve(e.data);
      else reject(new Error(`No Action data from worker ${actionPlanIndex}`));
    };

    const onWorkerError = ({ filename, lineno, colno, message, error }: ErrorEvent) => {
      worker.removeEventListener('message', onWorkerMessage);
      worker.terminate();
      const location = `Worker ${filename}:${lineno}:${colno}`;
      console.error(location, message, error);
      reject(error ?? new Error(`${location} ${message}`));
    };

    worker.addEventListener('message', onWorkerMessage, { once: true });
    worker.addEventListener('error', onWorkerError, { once: true });

    // Send data to web worker
    worker.postMessage({
      transactionPlan,
      witness,
      fullViewingKey,
      actionPlanIndex,
    } satisfies WasmBuildActionInput);
  });
};
