import { Code, ConnectError, createContextKey } from '@connectrpc/connect';
import { FullViewingKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

export const fvkCtx = createContextKey<() => Promise<FullViewingKey>>(() =>
  Promise.reject(new ConnectError('No full viewing key available', Code.FailedPrecondition)),
);
