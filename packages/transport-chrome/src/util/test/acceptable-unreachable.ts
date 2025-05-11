import { expect, TaskContext } from 'vitest';

export const failsOrUnreachable = (ctx: TaskContext, unreachableMessage: string) =>
  ctx.task.fails ? expect.fail('task failed successfully') : expect.unreachable(unreachableMessage);
