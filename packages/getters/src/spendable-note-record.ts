import { createGetter } from './utils/create-getter.js';
import { SpendableNoteRecord } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';

export const getAssetIdFromRecord = createGetter(
  (noteRecord?: SpendableNoteRecord) => noteRecord?.note?.value?.assetId,
);

export const getAmountFromRecord = createGetter(
  (noteRecord?: SpendableNoteRecord) => noteRecord?.note?.value?.amount,
);
