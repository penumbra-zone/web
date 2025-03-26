import { ContextKey, createContextKey, Client } from '@connectrpc/connect';
import type { CustodyService } from '@penumbra-zone/protobuf';

export const custodyClientCtx: ContextKey<Client<typeof CustodyService> | undefined> =
  createContextKey(undefined);
