import {
  AuctionId,
  DutchAuction,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import { viewClient } from '../clients';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getInputAssetId, getOutputAssetId } from '@penumbra-zone/getters/dutch-auction';

export interface AuctionInfo {
  id: AuctionId;
  auction: DutchAuction;
  localSeqNum: bigint;
  inputMetadata?: Metadata;
  outputMetadata?: Metadata;
}

export const getAuctionInfos = async function* ({
  queryLatestState = false,
}: {
  queryLatestState?: boolean;
} = {}): AsyncGenerator<AuctionInfo> {
  for await (const response of viewClient.auctions({ queryLatestState, includeInactive: true })) {
    if (!response.auction || !response.id) continue;

    const auction = DutchAuction.fromBinary(response.auction.value);

    const inputAssetId = getInputAssetId.optional()(auction);
    const outputAssetId = getOutputAssetId.optional()(auction);

    const inputMetadataPromise = inputAssetId
      ? viewClient.assetMetadataById({ assetId: inputAssetId })
      : undefined;
    const outputMetadataPromise = outputAssetId
      ? viewClient.assetMetadataById({ assetId: outputAssetId })
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
    };
  }
};
