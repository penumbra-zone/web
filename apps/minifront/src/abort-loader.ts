import { penumbra } from './penumbra';
import {
  PenumbraClient,
  PenumbraNotInstalledError,
  PenumbraProviderNotConnectedError,
} from '@penumbra-zone/client';

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

const throwIfProviderNotConnected = () => {
  if (!penumbra.connected) {
    throw new PenumbraProviderNotConnectedError();
  }
};

const throwIfProviderNotInstalled = () => {
  if (!Object.keys(PenumbraClient.getProviders()).length) {
    throw new PenumbraNotInstalledError();
  }
};

/**
 * Resolves fast if Prax is connected, or rejects if Prax is not connected after
 * timeout. This is a temporary solution until loaders properly await Prax
 * connection.
 */
export const abortLoader = async (): Promise<null> => {
  throwIfProviderNotInstalled();
  // Increased timeout from 500ms to 3000ms to allow reconnection to complete
  await retry(() => Boolean(penumbra.connected), 3000);
  throwIfProviderNotConnected();

  // Loaders are required to return a value, even if it's null. By returning
  // `null` here, we can use this loader directly in the router.
  return null;
};
