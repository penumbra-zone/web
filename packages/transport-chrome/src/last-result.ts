import { MockedFunction } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- vitest mock
export const lastResult = <T extends (...args: any[]) => any>(
  mfn: MockedFunction<T>,
): ReturnType<T> => {
  const last = mfn.mock.results.at(-1);
  if (last?.type === 'return') {
    return last.value as never;
  }
  throw last?.value;
};
