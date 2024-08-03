import { SpendView } from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import { createGetter } from './utils/create-getter.js';

export const getNote = createGetter((spendView?: SpendView) =>
  spendView?.spendView.case === 'visible' ? spendView.spendView.value.note : undefined,
);
