import { createGetter } from './utils/create-getter.js';
import { Swap } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';

export const getCommitment = createGetter((swap?: Swap) => swap?.body?.payload?.commitment);
