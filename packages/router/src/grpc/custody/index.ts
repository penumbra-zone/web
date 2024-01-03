import type { CustodyProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1alpha1/custody_connect';
import type { ServiceImpl } from '@connectrpc/connect';
export type Impl = ServiceImpl<typeof CustodyProtocolService>;

import { authorize } from './authorize';
import { exportFullViewingKey } from './export-full-viewing-key';

export const custodyImpl: Omit<Impl, 'confirmAddress'> = {
  authorize,
  exportFullViewingKey,
};
