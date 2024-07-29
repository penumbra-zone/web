import { AuctionId, DutchAuctionDescription, Metadata } from '@penumbra-zone/protobuf/types';
import { get_auction_id, get_auction_nft_metadata } from '../wasm/index.js';

export const getAuctionId = (dutchAuctionDescription: DutchAuctionDescription): AuctionId => {
  const result = get_auction_id(dutchAuctionDescription.toBinary());
  return AuctionId.fromBinary(result);
};

export const getAuctionNftMetadata = (auctionId: AuctionId, seq: bigint): Metadata => {
  const result = get_auction_nft_metadata(auctionId.toBinary(), seq);
  return Metadata.fromBinary(result);
};
