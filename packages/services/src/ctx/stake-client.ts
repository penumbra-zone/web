import { ContextKey, createContextKey, PromiseClient } from '@connectrpc/connect';
import type { StakeService } from '@penumbra-zone/protobuf';

export const stakeClientCtx: ContextKey<PromiseClient<typeof StakeService> | undefined> =
  createContextKey(undefined);
