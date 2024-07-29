import { ConnectError, createContextKey } from '@connectrpc/connect';
import { WalletId } from '@penumbra-zone/protobuf/types';

export const walletIdCtx = createContextKey<() => Promise<WalletId>>(() =>
  Promise.reject(new ConnectError('No wallet id available')),
);
