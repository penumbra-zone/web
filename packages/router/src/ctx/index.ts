import { createContextKey } from '@connectrpc/connect';

import type { Services } from '@penumbra-zone/services';
import { localExtStorage, sessionExtStorage } from '@penumbra-zone/storage';

import { getTxApproval } from './approver';

export const servicesCtx = createContextKey<Services>({} as Services);
export const extLocalCtx = createContextKey(localExtStorage);
export const extSessionCtx = createContextKey(sessionExtStorage);
export const approverCtx = createContextKey(getTxApproval);
