import { createGetter } from './utils/create-getter';
import { Swap } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';

export const getCommitment = createGetter((swap?: Swap) => swap?.body?.payload?.commitment);
