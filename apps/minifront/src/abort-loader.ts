import { isPraxConnected, throwIfPraxNotConnected, throwIfPraxNotInstalled } from './prax';

/**
 * Retry test, resolving `true`, or resolving `false` if timeout reached.
 *
 * @param fn test method returning a boolean
 * @param ms millisecond maximum wait. default half a second
 * @param rate wait between attempts. default `ms/10`, stays above 50ms unless set.
 * @returns promise that resolves to true if `fn` returns true, or false at timeout
 */
const retry = async (fn: () => boolean, ms = 500, rate = Math.max(ms / 10, 50)) =>
  fn() ||
  new Promise<boolean>(resolve => {
    const interval = setInterval(() => {
      if (fn()) {
        clearInterval(interval);
        resolve(true);
      }
    }, rate);
    setTimeout(() => {
      clearInterval(interval);
      resolve(false);
    }, ms);
  });

/**
 * Resolves fast if Prax is connected, or rejects if Prax is not connected after
 * timeout. This is a temporary solution until loaders properly await Prax
 * connection.
 */
export const abortLoader = async (): Promise<null> => {
  await throwIfPraxNotInstalled();
  await retry(() => isPraxConnected());
  throwIfPraxNotConnected();

  // Loaders are required to return a value, even if it's null. By returning
  // `null` here, we can use this loader directly in the router.
  return null;
};
