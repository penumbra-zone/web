import { ContextKey, createContextKey, Client } from '@connectrpc/connect';
import type { StakeService } from '@penumbra-zone/protobuf';

export const stakeClientCtx: ContextKey<Client<typeof StakeService> | undefined> =
  createContextKey(undefined);
