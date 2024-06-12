import {
  AuthorizationData,
  Transaction,
  TransactionPlan,
  WitnessData,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { buildParallel } from '@penumbra-zone/wasm/build';
import { buildActionsOffscreen } from '../../offscreen-runner';
import {
  AuthorizeAndBuildResponse,
  WitnessAndBuildResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { PartialMessage } from '@bufbuild/protobuf';
import { ConnectError } from '@connectrpc/connect';

import { FullViewingKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

export const optimisticBuild = async function* (
  offscreenUrl: string,
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
  const workerTasks = buildActionsOffscreen(
    offscreenUrl,
    transactionPlan,
    witnessData,
    fvk,
    cancel,
  );

  // status updates
  yield* progressStream(workerTasks, cancel);

  // final build is synchronous
  const transaction: Transaction = buildParallel(
    await Promise.all(workerTasks),
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
