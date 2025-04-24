/**
 *  The context keys in this file are very Prax-specific and, in the interest of
 *  portable service implementations, should eventually be refactored.
 */

import { createContextKey } from '@connectrpc/connect';
import type { ServicesInterface } from '@penumbra-zone/types/services';

export const servicesCtx = createContextKey<() => Promise<ServicesInterface>>(null as never, {
  description: 'A random collection of interfaces',
});
