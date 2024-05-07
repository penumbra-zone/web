import { Code, ConnectError, createContextKey } from '@connectrpc/connect';
import { SpendKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

export const skCtx = createContextKey<() => Promise<SpendKey>>(() =>
  Promise.reject(new ConnectError('No spend key available', Code.FailedPrecondition)),
);
