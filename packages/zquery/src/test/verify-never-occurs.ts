import { waitFor, waitForOptions } from '@testing-library/react';
import { expect } from 'vitest';

/**
 * @see https://stackoverflow.com/a/74555894/974981
 * Inverse of RTL's `waitFor`; used to verify that a thing does *not* occur.
 * Useful for situations in which verifying that some effect did occur would
 * require using `await waitFor()` and you need to test that the effect does
 * not occur. Like `waitFor`, it must be `await`ed.
 * @param {function} negativeAssertionFn - a callback function that expects a thing you do _not_ expect will occur
 * @param {Object} options - options object with same shape as `waitFor`'s options argument (ultimately just passed through to `waitFor`)
 * @return {void}
 */
const verifyNeverOccurs = async (negativeAssertionFn: () => unknown, options?: waitForOptions) => {
  await expect(waitFor(negativeAssertionFn, options)).rejects.toThrow();
};

export default verifyNeverOccurs;
