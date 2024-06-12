import { ConnectError, Transport, createContextKey } from '@connectrpc/connect';

export const fullnodeCtx = createContextKey<() => Promise<Transport>>(() =>
  Promise.reject(new ConnectError('No fullnode transport available')),
);
