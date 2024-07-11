import { SpendView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1/shielded_pool_pb.js';
import { createGetter } from './utils/create-getter.js';

export const getNote = createGetter((spendView?: SpendView) =>
  spendView?.spendView.case === 'visible' ? spendView.spendView.value.note : undefined,
);
