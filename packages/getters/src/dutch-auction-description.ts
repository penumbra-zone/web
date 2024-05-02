import { DutchAuctionDescription } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1alpha1/auction_pb';
import { createGetter } from './utils/create-getter';

export const getInputAssetId = createGetter(
  (dutchAuctionDescription?: DutchAuctionDescription) => dutchAuctionDescription?.input?.assetId,
);

export const getOutputAssetId = createGetter(
  (dutchAuctionDescription?: DutchAuctionDescription) => dutchAuctionDescription?.outputId,
);
