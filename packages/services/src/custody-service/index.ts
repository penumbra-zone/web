import type { CustodyService } from '@penumbra-zone/protobuf';
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
