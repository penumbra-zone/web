import { ContextKey, createContextKey, PromiseClient } from '@connectrpc/connect';
import type { CustodyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1/custody_connect';

export const custodyClientCtx: ContextKey<PromiseClient<typeof CustodyService> | undefined> =
  createContextKey(undefined);
