import { ContextKey, createContextKey, Client } from '@connectrpc/connect';
import type { StakeService } from '@penumbra-zone/protobuf';

export const stakeClientCtx: ContextKey<Client<typeof StakeService>> = createContextKey(
  null as never,
  { description: 'View service may call the stake service for delegation info' },
);
