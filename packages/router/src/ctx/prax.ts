/**
 *  The context keys in this file are very Prax-specific and, in the interest of
 *  portable service implementations, should eventually be refactored.
 */

import { createContextKey } from '@connectrpc/connect';
import { localExtStorage, sessionExtStorage } from '@penumbra-zone/storage';
import type { ServicesInterface } from '@penumbra-zone/types';

export const servicesCtx = createContextKey<ServicesInterface>({} as ServicesInterface);
export const extLocalCtx = createContextKey(localExtStorage);
export const extSessionCtx = createContextKey(sessionExtStorage);
