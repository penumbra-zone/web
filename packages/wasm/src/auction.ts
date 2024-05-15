import {
  AuctionId,
  DutchAuctionDescription,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import { get_auction_id, get_auction_nft_metadata } from '../wasm';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

export const getAuctionId = (dutchAuctionDescription: DutchAuctionDescription): AuctionId => {
  const result = get_auction_id(dutchAuctionDescription.toBinary());
  return AuctionId.fromBinary(result);
};

export const getAuctionNftMetadata = (auctionId: AuctionId, seq: bigint): Metadata => {
  const result = get_auction_nft_metadata(auctionId.toBinary(), seq);
  return Metadata.fromBinary(result);
};
