import {
  AuthorizationData,
  Transaction,
  TransactionPlan,
  WitnessData,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { buildParallel } from '@rotko/penumbra-wasm/build';
import { offscreenClient } from '../../offscreen-client.js';
import {
  AuthorizeAndBuildResponse,
  WitnessAndBuildResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { PartialMessage } from '@bufbuild/protobuf';
import { ConnectError } from '@connectrpc/connect';
import { FullViewingKey } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import {
  isParallelBuildAvailable,
  optimisticParallelBuild,
} from './build-tx-parallel.js';

export const optimisticBuild = async function* (
  transactionPlan: TransactionPlan,
  witnessData: WitnessData,
  authorizationRequest: PromiseLike<AuthorizationData>,
  fvk: FullViewingKey,
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

const progressStream = async function* <T>(tasks: PromiseLike<T>[], cancel: PromiseLike<never>) {
  // deliberately not a 'map' - tasks and promises have no direct relationship.
  const tasksRemaining = Array.from(tasks, () => Promise.withResolvers<void>());

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

/**
 * Build a transaction, using rayon parallel build if available,
 * otherwise falling back to offscreen-based JS worker build.
 *
 * Rayon parallel build is faster because:
 * - All actions are built concurrently in a single WASM call
 * - No JS worker overhead per action
 * - Rayon manages the thread pool efficiently
 *
 * @param transactionPlan - The transaction plan
 * @param witnessData - The witness data
 * @param authorizationRequest - Promise for authorization data
 * @param fvk - The full viewing key
 * @param useRayonParallel - If true and SharedArrayBuffer is available, use rayon parallel build
 */
export const buildTransaction = async function* (
  transactionPlan: TransactionPlan,
  witnessData: WitnessData,
  authorizationRequest: PromiseLike<AuthorizationData>,
  fvk: FullViewingKey,
  useRayonParallel = true,
): AsyncGenerator<PartialMessage<AuthorizeAndBuildResponse | WitnessAndBuildResponse>> {
  // Use rayon parallel build if enabled and SharedArrayBuffer is available
  if (useRayonParallel && isParallelBuildAvailable()) {
    console.log('[Build] Using rayon parallel build');
    yield* optimisticParallelBuild(transactionPlan, witnessData, authorizationRequest, fvk);
    return;
  }

  // Fall back to offscreen-based JS worker build
  console.log('[Build] Using offscreen JS worker build');
  yield* optimisticBuild(transactionPlan, witnessData, authorizationRequest, fvk);
};
