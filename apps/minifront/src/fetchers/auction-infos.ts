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
  inputMetadata?: Metadata;
  outputMetadata?: Metadata;
}

export const getAuctionInfos = async function* ({
  queryLatestState = false,
}: {
  queryLatestState?: boolean;
} = {}): AsyncGenerator<AuctionInfo> {
  for await (const response of viewClient.auctions(
    { queryLatestState, includeInactive: true },
    /**
     * Weirdly, just passing the newAbortController.signal here doesn't seem to
     * have any effect, despite the ConnectRPC docs saying that it should
     * work. I still left this line in, though, since it seems right and
     * perhaps will be fixed in a later ConnectRPC release. But in the
     * meantime, returning early from the `for` loop below fixes this issue.
     *
     * @see https://connectrpc.com/docs/web/cancellation-and-timeouts/
     */
  )) {
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
      inputMetadata: inputMetadata?.denomMetadata,
      outputMetadata: outputMetadata?.denomMetadata,
    };
  }
};
