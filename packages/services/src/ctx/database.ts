import { Code, ConnectError, createContextKey } from '@connectrpc/connect';
import { IndexedDbInterface } from '@penumbra-zone/types/indexed-db';

export const dbCtx = createContextKey<() => Promise<IndexedDbInterface>>(() =>
  Promise.reject(new ConnectError('No database available', Code.FailedPrecondition)),
);
