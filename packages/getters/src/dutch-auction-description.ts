import { DutchAuctionDescription } from '@penumbra-zone/protobuf/types';
import { createGetter } from './utils/create-getter.js';

export const getInputAssetId = createGetter(
  (dutchAuctionDescription?: DutchAuctionDescription) => dutchAuctionDescription?.input?.assetId,
);

export const getOutputAssetId = createGetter(
  (dutchAuctionDescription?: DutchAuctionDescription) => dutchAuctionDescription?.outputId,
);
