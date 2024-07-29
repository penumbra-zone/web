import { Code, ConnectError, createContextKey } from '@connectrpc/connect';
import { SpendKey } from '@penumbra-zone/protobuf/types';

export const skCtx = createContextKey<() => Promise<SpendKey>>(() =>
  Promise.reject(new ConnectError('No spend key available', Code.FailedPrecondition)),
);
