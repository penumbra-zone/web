import {
  AssetId,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { AuctionInfo, Filter } from '../../../state/swap/dutch-auction';
import { bech32mAssetId } from '@penumbra-zone/bech32m/passet';

const byStartHeight =
  (direction: 'ascending' | 'descending') => (a: AuctionInfo, b: AuctionInfo) => {
    if (!a.auction.description?.startHeight || !b.auction.description?.startHeight) return 0;
    if (direction === 'ascending') {
      return Number(a.auction.description.startHeight - b.auction.description.startHeight);
    }
    return Number(b.auction.description.startHeight - a.auction.description.startHeight);
  };

export const SORT_FUNCTIONS: Record<Filter, (a: AuctionInfo, b: AuctionInfo) => number> = {
  all: byStartHeight('ascending'),
  active: byStartHeight('descending'),
  upcoming: byStartHeight('ascending'),
};

export const getMetadata = (metadataByAssetId: Record<string, Metadata>, assetId?: AssetId) => {
  let metadata: Metadata | undefined;
  if (assetId && (metadata = metadataByAssetId[bech32mAssetId(assetId)])) {
    return metadata;
  }

  return new Metadata({ penumbraAssetId: assetId });
};
