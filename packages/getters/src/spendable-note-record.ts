import { createGetter } from './utils/create-getter.js';
import { SpendableNoteRecord } from '@penumbra-zone/protobuf/types';

export const getAssetIdFromRecord = createGetter(
  (noteRecord?: SpendableNoteRecord) => noteRecord?.note?.value?.assetId,
);

export const getAmountFromRecord = createGetter(
  (noteRecord?: SpendableNoteRecord) => noteRecord?.note?.value?.amount,
);
