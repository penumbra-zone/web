import { OutputView } from '@penumbra-zone/protobuf/types';
import { createGetter } from './utils/create-getter.js';

export const getNote = createGetter((outputView?: OutputView) =>
  outputView?.outputView.case === 'visible' ? outputView.outputView.value.note : undefined,
);
