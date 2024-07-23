import type { ServiceImpl } from '@connectrpc/connect';
import type { SctService } from '@penumbra-zone/protobuf';
import { epochByHeight } from './epoch-by-height.js';
import { timestampByHeight } from './timestamp-by-height.js';

export type Impl = ServiceImpl<typeof SctService>;

export const sctImpl: Omit<Impl, 'anchorByHeight'> = {
  epochByHeight,
  timestampByHeight,
};
