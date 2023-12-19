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

const spawnWorker = (
  transactionPlan: TransactionPlan,
  actionPlan: ActionPlan,
  witness: WitnessData,
  fullViewingKey: string,
  keyType: string,
): Promise<Action> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./web-worker.ts', import.meta.url));

    // Set up event listener to recieve messages from the web worker
    worker.addEventListener('message', e => {
      resolve(e.data as Action);
    });

    // Set up error handling
    worker.addEventListener('error', function (error) {
      console.error('Error in worker:', error);
      reject(error);
    });

    // Send data to web worker
    worker.postMessage({
      type: 'worker',
      data: {
        transactionPlan,
        actionPlan,
        witness,
        fullViewingKey,
        keyType,
      },
    });
  });
};

export const buildActionHandler: InternalMessageHandler<ActionBuildMessage> = (
  jsonReq,
  responder,
): void => {
  // Destructure the data object to get individual fields
  const { transactionPlan, actionPlan, witness, fullViewingKey, keyType } = jsonReq;

  // Array to store promises for each worker
  const workerPromises: Promise<Action>[] = [];

  // Spawn web workers
  for (const [i, action] of actionPlan.entries()) {
    workerPromises.push(spawnWorker(transactionPlan, action, witness, fullViewingKey, keyType[i]!));
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
    .catch(error => {
      // Handle errors here
      console.error('Error building action:', error);
    });
};
