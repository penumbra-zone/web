import { QueryService as SctService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/sct/v1/sct_connect';
import { ServiceImpl } from '@connectrpc/connect';
import { epochByHeight } from './epoch-by-height';

export type Impl = ServiceImpl<typeof SctService>;

export const sctImpl: Impl = {
  epochByHeight,
};
