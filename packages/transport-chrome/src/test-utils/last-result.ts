import { MockedFunction } from 'vitest';

/**
 * Returns the last result of a mocked function.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- test utility
export const lastResult = <T extends (...args: any[]) => any>(
  mfn: MockedFunction<T>,
): ReturnType<T> => {
  const last = mfn.mock.results.at(-1);
  if (last?.type === 'return') {
    return last.value as never;
  }
  throw last?.value;
};
