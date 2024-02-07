import { ContextKey, createContextKey, PromiseClient } from '@connectrpc/connect';
import type { Services } from '@penumbra-zone/services';
import { localExtStorage, sessionExtStorage } from '@penumbra-zone/storage';
import { getTxApproval } from './approver';
import type { CustodyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1/custody_connect';

export const servicesCtx = createContextKey<Services>({} as Services);
export const extLocalCtx = createContextKey(localExtStorage);
export const extSessionCtx = createContextKey(sessionExtStorage);
export const approverCtx = createContextKey(getTxApproval);
export const custodyCtx: ContextKey<PromiseClient<typeof CustodyService> | undefined> =
  createContextKey({} as PromiseClient<typeof CustodyService>);
