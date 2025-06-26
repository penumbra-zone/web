import { ContextKey, createContextKey, Client } from '@connectrpc/connect';
import type { CustodyService } from '@penumbra-zone/protobuf';

export const custodyClientCtx: ContextKey<Client<typeof CustodyService>> = createContextKey(
  null as never,
  { description: 'View service may call the custody service for authorizations' },
);
