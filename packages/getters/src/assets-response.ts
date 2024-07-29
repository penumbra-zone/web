import { createGetter } from './utils/create-getter.js';
import { AssetsResponse } from '@penumbra-zone/protobuf/types';

export const getDenomMetadata = createGetter(
  (assetsResponse?: AssetsResponse) => assetsResponse?.denomMetadata,
);
