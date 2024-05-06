/**
 *  The context keys in this file are very Prax-specific and, in the interest of
 *  portable service implementations, should eventually be refactored.
 */

import { Code, ConnectError, createContextKey } from '@connectrpc/connect';
import { localExtStorage } from '@penumbra-zone/storage/chrome/local';
import { sessionExtStorage } from '@penumbra-zone/storage/chrome/session';
import type { ServicesInterface } from '@penumbra-zone/types/services';

export const servicesCtx = createContextKey<() => Promise<ServicesInterface>>(() =>
  Promise.reject(new ConnectError('No prax services interface available', Code.FailedPrecondition)),
);
export const extLocalCtx = createContextKey(localExtStorage);
export const extSessionCtx = createContextKey(sessionExtStorage);
