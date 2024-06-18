import type { ServiceImpl } from '@connectrpc/connect';
import type { SctService } from '@penumbra-zone/protobuf';
import { epochByHeight } from './epoch-by-height';

export type Impl = ServiceImpl<typeof SctService>;

export const sctImpl: Omit<Impl, 'anchorByHeight' | 'timestampByHeight'> = {
  epochByHeight,
};
