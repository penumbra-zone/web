/**
 *  The context keys in this file are very Prax-specific and, in the interest of
 *  portable service implementations, should eventually be refactored.
 */

import { ConnectError, createContextKey } from '@connectrpc/connect';
import { localExtStorage } from '@penumbra-zone/storage/chrome/local';
import { sessionExtStorage } from '@penumbra-zone/storage/chrome/session';
import { IndexedDbInterface } from '@penumbra-zone/types/indexed-db';
import { RootQuerierInterface } from '@penumbra-zone/types/querier';

export const extLocalCtx = createContextKey(localExtStorage);
export const extSessionCtx = createContextKey(sessionExtStorage);

export const querierCtx = createContextKey<() => Promise<RootQuerierInterface>>(() =>
  Promise.reject(new ConnectError('No querier available')),
);

export const idbCtx = createContextKey<() => Promise<IndexedDbInterface>>(() =>
  Promise.reject(new ConnectError('No db available')),
);
