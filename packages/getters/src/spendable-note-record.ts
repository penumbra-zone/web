import { createGetter } from './utils/create-getter';
import { SpendableNoteRecord } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

export const getAssetIdFromRecord = createGetter(
  (noteRecord?: SpendableNoteRecord) => noteRecord?.note?.value?.assetId,
);

export const getAmountFromRecord = createGetter(
  (noteRecord?: SpendableNoteRecord) => noteRecord?.note?.value?.amount,
);
