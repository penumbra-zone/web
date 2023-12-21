import {
  InternalMessageHandler,
  InternalResponse,
} from '@penumbra-zone/types/src/internal-msg/shared';
import { ActionBuildMessage } from './types';
import {
  Action,
  ActionPlan,
  TransactionPlan,
  WitnessData,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { JsonValue } from '@bufbuild/protobuf';

const spawnWorker = (
  transactionPlan: JsonValue,
  witness: JsonValue,
  fullViewingKey: string,
  actionId: number,
): Promise<Action> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./web-worker.ts', import.meta.url));

    // Triggered on receiving message from worker
    const onMessage = (e: MessageEvent) => {
      resolve(e.data as Action);

      // Clean up event listener and terminate worker to prevent memory leaks
      worker.removeEventListener('message', onMessage);
      worker.terminate();
    };

    // Initiate event listener to receive messages from the web worker
    worker.addEventListener('message', onMessage);

    // Set up error handling
    worker.addEventListener('error', function (error) {
      reject(error);
      worker.removeEventListener('message', onMessage);
      worker.terminate();
    });

    // Send data to web worker
    worker.postMessage({
      type: 'worker',
      data: {
        transactionPlan,
        witness,
        fullViewingKey,
        actionId,
      },
    });
  });
};

export const buildActionHandler: InternalMessageHandler<ActionBuildMessage> = (
  jsonReq,
  responder,
): void => {
  // Destructure the data object to get individual fields
  const { transactionPlan, witness, fullViewingKey, length } = jsonReq;

  // Array to store promises for each worker
  const workerPromises: Promise<Action>[] = [];

  // Spawn web workers
  for (let i = 0; i < 1; i++) {
    workerPromises.push(spawnWorker(transactionPlan, witness, fullViewingKey, i));
  }

  // Wait for promises to resolve and construct response format
  Promise.all(workerPromises)
    .then(batchActions => {
      const response: InternalResponse<ActionBuildMessage> = {
        type: 'BUILD_ACTION',
        data: batchActions,
      };

      responder(response);
    })
    .catch(() => {
      throw new Error('Error resolving promise in worker');
    });
};
