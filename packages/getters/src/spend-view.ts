import { SpendView } from '@penumbra-zone/protobuf/types';
import { createGetter } from './utils/create-getter.js';

export const getNote = createGetter((spendView?: SpendView) =>
  spendView?.spendView.case === 'visible' ? spendView.spendView.value.note : undefined,
);
