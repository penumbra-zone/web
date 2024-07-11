import { OutputView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1/shielded_pool_pb.js';
import { createGetter } from './utils/create-getter.js';

export const getNote = createGetter((outputView?: OutputView) =>
  outputView?.outputView.case === 'visible' ? outputView.outputView.value.note : undefined,
);
