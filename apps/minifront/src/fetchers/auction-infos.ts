import {
  AuctionId,
  DutchAuction,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb.js';
import { ViewService } from '@penumbra-zone/protobuf';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb.js';
import { getInputAssetId, getOutputAssetId } from '@penumbra-zone/getters/dutch-auction';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb.js';
import { penumbra } from '../prax';

export interface AuctionInfo {
  id: AuctionId;
  auction: DutchAuction;
  localSeqNum: bigint;
  inputMetadata?: Metadata;
  outputMetadata?: Metadata;
  addressIndex: AddressIndex;
}

export const getAuctionInfos = async function* ({
  queryLatestState = false,
}: {
  queryLatestState?: boolean;
} = {}): AsyncGenerator<AuctionInfo> {
  for await (const response of penumbra
    .service(ViewService)
    .auctions({ queryLatestState, includeInactive: true })) {
    if (!response.auction || !response.id || !response.noteRecord?.addressIndex) {
      continue;
    }

    const auction = DutchAuction.fromBinary(response.auction.value);

    const inputAssetId = getInputAssetId.optional()(auction);
    const outputAssetId = getOutputAssetId.optional()(auction);

    const inputMetadataPromise = inputAssetId
      ? penumbra.service(ViewService).assetMetadataById({ assetId: inputAssetId })
      : undefined;
    const outputMetadataPromise = outputAssetId
      ? penumbra.service(ViewService).assetMetadataById({ assetId: outputAssetId })
      : undefined;

    const [inputMetadata, outputMetadata] = await Promise.all([
      inputMetadataPromise,
      outputMetadataPromise,
    ]);

    yield {
      id: response.id,
      auction,
      localSeqNum: response.localSeq,
      inputMetadata: inputMetadata?.denomMetadata,
      outputMetadata: outputMetadata?.denomMetadata,
      addressIndex: response.noteRecord.addressIndex,
    };
  }
};
