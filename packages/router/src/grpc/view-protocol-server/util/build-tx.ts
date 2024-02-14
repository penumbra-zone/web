import {
  TransactionPlan,
  WitnessData,
  AuthorizationData,
  Transaction,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { buildParallel } from '@penumbra-zone/wasm-ts';
import { offscreenClient } from '../../offscreen-client';
import {
  AuthorizeAndBuildResponse,
  WitnessAndBuildResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { PartialMessage } from '@bufbuild/protobuf';
import { ConnectError } from '@connectrpc/connect';
import '@penumbra-zone/types/src/promise-with-resolvers';

export const optimisticBuild = async function* (
  transactionPlan: TransactionPlan,
  witnessData: WitnessData,
  authorizationRequest: PromiseLike<AuthorizationData>,
  fvk: string,
) {
  // A promise that never resolves, but will reject if auth denies. Raced with
  // build tasks to cancel them if auth fails.
  const cancel = new Promise<never>(
    (_, reject) =>
      void Promise.resolve(authorizationRequest).catch((r: unknown) =>
        reject(ConnectError.from(r)),
      ),
  );

  // kick off the parallel actions build
  const offscreenTasks = offscreenClient.buildActions(transactionPlan, witnessData, fvk, cancel);

  // status updates
  yield* progressStream(offscreenTasks, cancel);

  // final build is synchronous
  const transaction: Transaction = buildParallel(
    await Promise.all(offscreenTasks),
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

/**
 * Given an array of tasks in the form of promises, yields a `buildProgress`
 * status update as each one completes. This is useful for RPC methods of the
 * `MethodKind.ServerStreaming` variety, where we get back incremental updates
 * from the server.
 */
const progressStream = async function* <T>(tasks: PromiseLike<T>[], cancel: PromiseLike<never>) {
  // `remainingTasksTracker` is just a way of keeping track of the _count_ of
  // remaining tasks. To make that clear, we'll create it as an array of
  // `PromiseWithResolvers`s with no values to resolve to. That's because
  // there's no direct relationship between the _contents_ of `tasks` and
  // `remainingTasksTracker` -- rather, just between the _lengths_.
  const remainingTasksTracker = Array.from(tasks, () => Promise.withResolvers<T>());

  // `remainingTasksTracker` will be consumed in order, as `tasks` complete in
  // any order.
  tasks.forEach(task => void task.then(() => remainingTasksTracker.shift()?.resolve(task)));

  // yield status when any task resolves the next 'remaining' promise
  while (remainingTasksTracker.length) {
    await Promise.race([cancel, remainingTasksTracker[0]?.promise]);
    yield {
      status: {
        case: 'buildProgress',
        // +1 to represent the final build step, which we aren't handling here
        value: { progress: (tasks.length - remainingTasksTracker.length) / (tasks.length + 1) },
      },
      // TODO: satisfies type parameter?
    } satisfies PartialMessage<AuthorizeAndBuildResponse | WitnessAndBuildResponse>;
  }
};
