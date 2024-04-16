import { ContextKey, createContextKey, PromiseClient } from '@connectrpc/connect';
import type { QueryService as StakingService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/stake/v1/stake_connect';

export const stakingClientCtx: ContextKey<PromiseClient<typeof StakingService> | undefined> =
  createContextKey(undefined);
