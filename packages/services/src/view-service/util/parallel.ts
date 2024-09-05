import { JsonObject, JsonValue } from '@bufbuild/protobuf';
import { FullViewingKey } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import {
  Action,
  TransactionPlan,
  WitnessData,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { WorkerBuildAction } from './build-action-worker.js';
import { ConnectError } from '@connectrpc/connect';

/**
 * Build actions in parallel by launching a worker for each action in the plan.
 * @returns An individually-promised list of build results.
 */
export const launchActionWorkers = (
  transactionPlan: TransactionPlan,
  witness: WitnessData,
  fullViewingKey: FullViewingKey,
  signal: AbortSignal,
): Promise<Action>[] => {
  const partialRequest: Omit<WorkerBuildAction, 'actionPlanIndex'> = {
    transactionPlan: transactionPlan.toJson() as JsonObject,
    witness: witness.toJson() as JsonObject,
    fullViewingKey: fullViewingKey.toJson() as JsonObject,
  };

  const workerOutputs = transactionPlan.actions.map(async (_, actionPlanIndex) => {
    const buildReq: WorkerBuildAction = {
      ...partialRequest,
      actionPlanIndex,
    };

    const actionWorker = new Worker(new URL('./build-action-worker.js', import.meta.url));

    const buildRes = await new Promise<Action>((resolve, reject) => {
      signal.addEventListener('abort', () => reject(ConnectError.from(signal.reason)));
      signal.throwIfAborted();

      actionWorker.onmessage = evt => {
        console.debug('actionWorker.onmessage', evt.data);
        resolve(Action.fromJson(evt.data as JsonValue));
      };
      actionWorker.onerror = evt => {
        console.debug('actionWorker.onerror', evt.error);
        reject(evt.error as Error);
      };
      actionWorker.onmessageerror = evt => {
        console.debug('actionWorker.onmessageerror', evt.data);
        reject(new Error('Message Error', { cause: evt.data }));
      };

      actionWorker.postMessage(buildReq);
    }).finally(() => {
      console.debug('actionWorker finally');
      actionWorker.terminate();
    });

    return buildRes;
  });

  return workerOutputs;
};

/** Generic progress tracking for some set of parallel tasks. Yields a fraction
 * from 0 to 1 representing (completed / tasks.length). The offset parameter
 * represents some number of other tasks known by the caller. */
export const taskProgress = async function* (
  tasks: Promise<unknown>[],
  signal: AbortSignal,
  offsetTotal = 0,
): AsyncGenerator<number> {
  const cancel = new Promise<never>((_, reject) => {
    signal.addEventListener('abort', () => reject(ConnectError.from(signal.reason)));
  });

  // tasksRemaining is deliberately not a 'map' - tasks and promises have no
  // direct relationship.  tasksRemaining will be consumed in order, as tasks
  // complete in any order.
  const tasksRemaining = Array.from(tasks, () => Promise.withResolvers<void>());
  tasks.forEach(task => void task.then(() => tasksRemaining.shift()?.resolve()));

  // yield status when any task resolves the next 'remaining' promise
  while (tasksRemaining.length) {
    await Promise.race([cancel, tasksRemaining[0]?.promise]);
    // +offset to represent some portion of the task known by the caller
    const completed = tasks.length - tasksRemaining.length;
    yield completed / (tasks.length + offsetTotal);
  }
};
