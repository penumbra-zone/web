/* eslint-disable @typescript-eslint/no-non-null-assertion -- test utils */
import { expect, MockedFunction, vi } from 'vitest';

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

/** Default for replaced listeners. */
const replacedUnhandledExceptionLogger: NodeJS.UncaughtExceptionListener = (
  uncaughtException,
  exceptionOrigin,
): void =>
  console.debug(
    '\x1b[33m%s\x1b[0m',
    `replaced ${exceptionOrigin} listener called with items:`,
    uncaughtException,
  );

const replacedUnhandledRejectionLogger: NodeJS.UnhandledRejectionListener = (
  unhandledRejection,
  promiseOrigin,
): void => {
  console.debug(
    '\x1b[33m%s\x1b[0m',
    'replaced unhandledRejection listener detected promise rejection',
    { unhandledRejection, promiseOrigin },
  );
};

/**
 * Necessary for old vitest.
 * @see https://github.com/vitest-dev/vitest/commit/c8d56fe5fceabfc61b8f1e42e9d30f740e671638#diff-c49d7f13cf089b49c98c93fc496d9f17280b7d50142330a79d3b03cb5bd1bc06R60-R68
 *
 * Must be used like this:
 * ```ts
 * const { uncaughtExceptionListener, restoreUncaughtExceptionListener } = replaceUncaughtExceptionListener();
 * onTestFinished(restoreUncaughtExceptionListener);
 * ```
 */
export const replaceUncaughtExceptionListener = (
  uncaughtExceptionListener = vi.fn(replacedUnhandledExceptionLogger),
) => {
  expect(process.listeners('uncaughtException').length).toBe(1);
  const originalUncaughtExceptionListener = process.listeners('uncaughtException')[0]!;
  process.removeListener('uncaughtException', originalUncaughtExceptionListener);
  process.addListener('uncaughtException', uncaughtExceptionListener);
  const restoreUncaughtExceptionListener = () => {
    process.removeListener('uncaughtException', uncaughtExceptionListener);
    process.addListener('uncaughtException', originalUncaughtExceptionListener);
  };
  return { uncaughtExceptionListener, restoreUncaughtExceptionListener };
};

/**
 * Necessary for old vitest.
 * @see https://github.com/vitest-dev/vitest/commit/c8d56fe5fceabfc61b8f1e42e9d30f740e671638#diff-c49d7f13cf089b49c98c93fc496d9f17280b7d50142330a79d3b03cb5bd1bc06R60-R68
 *
 * Must be used like this:
 * ```ts
 * const { unhandledRejectionListener, restoreUnhandledRejectionListener } = replaceUnhandledRejectionListener();
 * onTestFinished(restoreUnhandledRejectionListener);
 * ```
 */
export const replaceUnhandledRejectionListener = (
  unhandledRejectionListener = vi.fn(replacedUnhandledRejectionLogger),
) => {
  expect(process.listeners('unhandledRejection').length).toBe(1);
  const originalUnhandledRejectionListener = process.listeners('unhandledRejection')[0]!;
  process.removeListener('unhandledRejection', originalUnhandledRejectionListener);
  process.addListener('unhandledRejection', unhandledRejectionListener);
  const restoreUnhandledRejectionListener = () => {
    process.removeListener('unhandledRejection', unhandledRejectionListener);
    process.addListener('unhandledRejection', originalUnhandledRejectionListener);
  };
  return {
    unhandledRejectionListener,
    restoreUnhandledRejectionListener,
  };
};
