import { Note } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1/shielded_pool_pb.js';
import { createGetter } from './utils/create-getter.js';

export const getAmountFromNote = createGetter((note?: Note) => note?.value?.amount);
