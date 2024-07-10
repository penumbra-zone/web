import { createGetter } from './utils/create-getter.js';
import { AssetsResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';

export const getDenomMetadata = createGetter(
  (assetsResponse?: AssetsResponse) => assetsResponse?.denomMetadata,
);
