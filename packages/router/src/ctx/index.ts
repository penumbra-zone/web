import { ContextKey, PromiseClient, createContextKey } from '@connectrpc/connect';

import type { Services } from '@penumbra-zone/services';
import { localExtStorage, sessionExtStorage } from '@penumbra-zone/storage';

import { getTxApproval } from './approver';
import { assertWalletId } from './wallet-id';
import type { CustodyProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1alpha1/custody_connect';

export const servicesCtx = createContextKey<Services>({} as Services);
export const extLocalCtx = createContextKey(localExtStorage);
export const extSessionCtx = createContextKey(sessionExtStorage);
export const approverCtx = createContextKey(getTxApproval);
export const assertWalletIdCtx = createContextKey(assertWalletId);

export const custodyCtx: ContextKey<PromiseClient<typeof CustodyProtocolService> | undefined> 
    = createContextKey({} as PromiseClient<typeof CustodyProtocolService>);
