import { createGetter } from './utils/create-getter.js';
import { SpendableNoteRecord } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

export const getAssetIdFromRecord = createGetter(
  (noteRecord?: SpendableNoteRecord) => noteRecord?.note?.value?.assetId,
);

export const getAmountFromRecord = createGetter(
  (noteRecord?: SpendableNoteRecord) => noteRecord?.note?.value?.amount,
);

export const getSpendableNoteRecordCommitment = createGetter(
  (note?: SpendableNoteRecord) => note?.noteCommitment,
);
