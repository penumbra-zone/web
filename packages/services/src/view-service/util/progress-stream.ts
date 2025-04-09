import { PartialMessage } from '@bufbuild/protobuf';
import {
  AuthorizeAndBuildResponse,
  WitnessAndBuildResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

export const progressStream = async function* (tasks: Promise<unknown>[]) {
  // deliberately not a 'map' - tasks and promises have no direct relationship.
  const tasksRemaining = Array.from(tasks, () => Promise.withResolvers<void>());

  // tasksRemaining will be consumed in order, as tasks complete in any order.
  tasks.forEach(
    task =>
      void task.then(
        () => tasksRemaining.shift()?.resolve(),
        (x: unknown) => tasksRemaining.shift()?.reject(x),
      ),
  );

  // yield status when any task resolves the next 'remaining' promise
  while (tasksRemaining.length) {
    await tasksRemaining[0]?.promise;
    yield {
      status: {
        case: 'buildProgress',
        // +1 to represent the final build step, which we aren't handling here
        value: { progress: (tasks.length - tasksRemaining.length) / (tasks.length + 1) },
      },
    } satisfies PartialMessage<AuthorizeAndBuildResponse | WitnessAndBuildResponse>;
  }
};
