import type { CustodyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1/custody_connect';
import type { ServiceImpl } from '@connectrpc/connect';
import { authorize } from './authorize';

export type Impl = ServiceImpl<typeof CustodyService>;

export const custodyImpl: Omit<
  Impl,
  | 'confirmAddress'
  | 'exportFullViewingKey'
  | 'authorizeValidatorVote'
  | 'authorizeValidatorDefinition'
> = {
  authorize,
};
