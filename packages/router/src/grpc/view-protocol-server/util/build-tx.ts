import {
  TransactionPlan,
  WitnessData,
  AuthorizationData,
  Transaction,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { buildParallel } from '@penumbra-zone/wasm';
import { offscreenClient } from '../../offscreen-client';
import {
  AuthorizeAndBuildResponse,
  WitnessAndBuildResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { PartialMessage } from '@bufbuild/protobuf';
import { ConnectError } from '@connectrpc/connect';

import '@penumbra-zone/polyfills/Promise.withResolvers';

export const optimisticBuild = async function* (
  transactionPlan: TransactionPlan,
  witnessData: WitnessData,
  authorizationRequest: PromiseLike<AuthorizationData>,
  fvk: string,
) {
  performance.mark('optimisticBuild-begin');
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
  performance.mark('buildParallel-start');
  const transaction: Transaction = buildParallel(
    await Promise.all(offscreenTasks),
    transactionPlan,
    witnessData,
    await authorizationRequest,
  );
  performance.mark('buildParallel-end');

  yield {
    status: {
      case: 'complete',
      value: { transaction },
    },
    // TODO: satisfies type parameter?
  } satisfies PartialMessage<AuthorizeAndBuildResponse | WitnessAndBuildResponse>;
  performance.mark('optimisticBuild-end');
  performance.measure('optimisticBuild', 'optimisticBuild-begin', 'optimisticBuild-end');
  performance.measure('buildParallel', 'buildParallel-start', 'buildParallel-end');
  console.log(performance.getEntriesByType('measure'));
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
