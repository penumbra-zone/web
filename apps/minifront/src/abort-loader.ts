import {
  isPraxConnected,
  throwIfPraxNotConnected,
  throwIfPraxNotInstalled,
} from '@penumbra-zone/client/prax';

const retry = (fn: () => boolean, ms: number) =>
  new Promise<boolean>(resolve => {
    if (fn()) resolve(true);
    const interval = setInterval(
      () => {
        if (!fn()) return;
        clearInterval(interval);
        resolve(true);
      },
      Math.max(ms / 10, 50),
    );
    setTimeout(() => {
      clearInterval(interval);
      resolve(false);
    }, ms);
  });

/**
 * Resolves fast if Prax is connected, or rejects if Prax is not connected after
 * timeout. This is a temporary solution until loaders properly await Prax
 * connection.
 *
 * @param timeout maximum wait in milliseconds (default 500)
 */
export const abortLoader = async (timeout = 500): Promise<void> => {
  await throwIfPraxNotInstalled();
  (await retry(() => isPraxConnected(), timeout)) || throwIfPraxNotConnected();
};
