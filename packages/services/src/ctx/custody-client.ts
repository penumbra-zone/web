import { ContextKey, createContextKey, PromiseClient } from '@connectrpc/connect';
import type { CustodyService } from '@penumbra-zone/protobuf';

export const custodyClientCtx: ContextKey<PromiseClient<typeof CustodyService> | undefined> =
  createContextKey(undefined);
