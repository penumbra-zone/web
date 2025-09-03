import { Code, ConnectError, createContextKey } from '@connectrpc/connect';
import { FullViewingKey } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

export const fvkCtx = createContextKey<() => Promise<FullViewingKey>>(
  /** A stub implementation that always throws an error. */
  () => Promise.reject(new ConnectError('Default full viewing key stub', Code.Unimplemented)),
  { description: 'View service requires a full viewing key' },
);
