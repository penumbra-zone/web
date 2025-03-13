import {
  AuctionId,
  AuctionIdSchema,
  DutchAuctionDescription,
  DutchAuctionDescriptionSchema,
} from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';
import { fromBinary, toBinary } from '@bufbuild/protobuf';
import { MetadataSchema } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import type { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { get_auction_id, get_auction_nft_metadata } from '../wasm/index.js';

export const getAuctionId = (dutchAuctionDescription: DutchAuctionDescription): AuctionId => {
  const result = get_auction_id(toBinary(DutchAuctionDescriptionSchema, dutchAuctionDescription));
  return fromBinary(AuctionIdSchema, result);
};

export const getAuctionNftMetadata = (auctionId: AuctionId, seq: bigint): Metadata => {
  const result = get_auction_nft_metadata(toBinary(AuctionIdSchema, auctionId), seq);
  return fromBinary(MetadataSchema, result);
};
