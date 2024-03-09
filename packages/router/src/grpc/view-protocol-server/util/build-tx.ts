import {
  TransactionPlan,
  WitnessData,
  AuthorizationData,
  Transaction,
  Action,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { buildTransaction } from '@penumbra-zone/wasm';
import {
  AuthorizeAndBuildResponse,
  WitnessAndBuildResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import type { JsonObject, PartialMessage } from '@bufbuild/protobuf';
import { ConnectError } from '@connectrpc/connect';
import type { ActionBuildRequest } from './worker-message';
import type { Jsonified } from '@penumbra-zone/types';

import '@penumbra-zone/polyfills/Promise.withResolvers';

export const optimisticBuild = async function* (
  transactionPlan: TransactionPlan,
  witnessData: WitnessData,
  authorizationRequest: PromiseLike<AuthorizationData>,
  fvk: string,
) {
  // a promise that rejects if auth denies. raced with build tasks to cancel.
  // if we raced auth directly, approval would complete the race.
  const cancel = new Promise<never>(
    (_, reject) =>
      void Promise.resolve(authorizationRequest).catch((r: unknown) =>
        reject(ConnectError.from(r)),
      ),
  );

  // kick off the parallel actions build
  const actionBuildRequest: Omit<ActionBuildRequest, 'actionPlanIndex'> = {
    transactionPlan: transactionPlan.toJson() as Jsonified<TransactionPlan>,
    witness: witnessData.toJson() as Jsonified<WitnessData>,
    fullViewingKey: fvk,
  };
  const buildTasks = transactionPlan.actions.map((_, actionPlanIndex) =>
    actionBuild(cancel, {
      ...actionBuildRequest,
      actionPlanIndex,
    } satisfies ActionBuildRequest),
  );

  // status updates
  yield* progressStream(buildTasks, cancel);

  // final build is synchronous
  const transaction: Transaction = buildTransaction(
    await Promise.all(buildTasks),
    transactionPlan,
    witnessData,
    await authorizationRequest,
  );

  yield {
    status: {
      case: 'complete',
      value: { transaction },
    },
    // TODO: satisfies type parameter?
  } satisfies PartialMessage<AuthorizeAndBuildResponse | WitnessAndBuildResponse>;
};

const progressStream = async function* <T>(tasks: PromiseLike<T>[], cancel: PromiseLike<never>) {
  // deliberately not a 'map' - tasks and promises have no direct relationship.
  const tasksRemaining = Array.from(tasks, () => Promise.withResolvers());

  // tasksRemaining will be consumed in order, as tasks complete in any order.
  tasks.forEach(task => void task.then(() => tasksRemaining.shift()?.resolve()));

  // yield status when any task resolves the next 'remaining' promise
  while (tasksRemaining.length) {
    await Promise.race([cancel, tasksRemaining[0]?.promise]);
    yield {
      status: {
        case: 'buildProgress',
        // +1 to represent the final build step, which we aren't handling here
        value: { progress: (tasks.length - tasksRemaining.length) / (tasks.length + 1) },
      },
      // TODO: satisfies type parameter?
    } satisfies PartialMessage<AuthorizeAndBuildResponse | WitnessAndBuildResponse>;
  }
};

const actionBuild = (cancel: Promise<never>, req: ActionBuildRequest): Promise<Action> => {
  const actionWorker = new Worker(new URL('./wasm-build-action.ts', import.meta.url), {
    type: 'module',
  });

  const { promise: actionJson, resolve, reject } = Promise.withResolvers<Jsonified<Action>>();
  const listenMessage = (e: MessageEvent<unknown>) => resolve(e.data as JsonObject);
  const listenMessageError = (ev: MessageEvent<unknown>) => {
    console.error('Error receiving message from worker', ev);
    reject(ConnectError.from(ev));
  };
  const listenError = (ev: ErrorEvent) => {
    const { filename, lineno, colno, message } = ev;
    console.warn(`Worker ErrorEvent ${filename}:${lineno}:${colno} ${message}`, ev);
    reject(ConnectError.from(ev.error ?? ev.message));
  };

  actionWorker.addEventListener('message', listenMessage, { once: true });
  actionWorker.addEventListener('messageerror', listenMessageError, { once: true });
  actionWorker.addEventListener('error', listenError, { once: true });
  actionWorker.postMessage(req);

  return Promise.race([cancel, actionJson])
    .then(j => Action.fromJson(j))
    .finally(() => actionWorker.terminate());
};
