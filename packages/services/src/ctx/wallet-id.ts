import { Code, ConnectError, createContextKey } from '@connectrpc/connect';
import { WalletId } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

export const walletIdCtx = createContextKey<() => Promise<WalletId>>(
  /** A stub implementation that always throws an error. */
  () => Promise.reject(new ConnectError('Default wallet id stub', Code.Unimplemented)),
  { description: 'Some view service methods will refer to the wallet id' },
);
