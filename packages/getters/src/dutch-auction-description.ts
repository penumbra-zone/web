import { DutchAuctionDescription } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb.js';
import { createGetter } from './utils/create-getter.js';

export const getInputAssetId = createGetter(
  (dutchAuctionDescription?: DutchAuctionDescription) => dutchAuctionDescription?.input?.assetId,
);

export const getOutputAssetId = createGetter(
  (dutchAuctionDescription?: DutchAuctionDescription) => dutchAuctionDescription?.outputId,
);
