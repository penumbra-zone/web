/**
 *  The context keys in this file are very Prax-specific and, in the interest of
 *  portable service implementations, should eventually be refactored.
 */

import { ConnectError, createContextKey } from '@connectrpc/connect';
import type { ServicesInterface } from '@penumbra-zone/types/services';

export const servicesCtx = createContextKey<() => Promise<ServicesInterface>>(() =>
  Promise.reject(new ConnectError('No prax services interface available')),
);
