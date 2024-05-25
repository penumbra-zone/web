import { AllSlices } from '../../../state';
import { DutchAuctionComponent } from '@penumbra-zone/ui/components/ui/dutch-auction-component';
import {
  AssetId,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { bech32mAssetId } from '@penumbra-zone/bech32m/passet';
import { AuctionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import { GradientHeader } from '@penumbra-zone/ui/components/ui/gradient-header';
import { QueryLatestStateButton } from './query-latest-state-button';
import { Card } from '@penumbra-zone/ui/components/ui/card';
import { bech32mAuctionId } from '@penumbra-zone/bech32m/pauctid';
import { SegmentedPicker } from '@penumbra-zone/ui/components/ui/segmented-picker';
import { useMemo } from 'react';
import { getFilteredAuctionInfos } from './get-filtered-auction-infos';
import { LayoutGroup } from 'framer-motion';
import { AuctionInfo, Filter } from '../../../state/swap/dutch-auction';

const byStartHeightAscending = (a: AuctionInfo, b: AuctionInfo) => {
  if (!a.auction.description?.startHeight || !b.auction.description?.startHeight) return 0;
  return Number(a.auction.description.startHeight - b.auction.description.startHeight);
};

const byStartHeightDescending = (a: AuctionInfo, b: AuctionInfo) => {
  if (!a.auction.description?.startHeight || !b.auction.description?.startHeight) return 0;
  return Number(b.auction.description.startHeight - a.auction.description.startHeight);
};

const SORT_FUNCTIONS: Record<Filter, (a: AuctionInfo, b: AuctionInfo) => number> = {
  all: byStartHeightAscending,
  active: byStartHeightDescending,
  upcoming: byStartHeightAscending,
};

const getMetadata = (metadataByAssetId: Record<string, Metadata>, assetId?: AssetId) => {
  let metadata: Metadata | undefined;
  if (assetId && (metadata = metadataByAssetId[bech32mAssetId(assetId)])) {
    return metadata;
  }

  return new Metadata({ penumbraAssetId: assetId });
};

const auctionListSelector = (state: AllSlices) => ({
  auctionInfos: state.swap.dutchAuction.auctionInfos,
  metadataByAssetId: state.swap.dutchAuction.metadataByAssetId,
  fullSyncHeight: state.status.fullSyncHeight,
  endAuction: state.swap.dutchAuction.endAuction,
  withdraw: state.swap.dutchAuction.withdraw,
  filter: state.swap.dutchAuction.filter,
  setFilter: state.swap.dutchAuction.setFilter,
});

const getButtonProps = (
  auctionId: AuctionId,
  endAuction: (auctionId: AuctionId) => Promise<void>,
  withdraw: (auctionId: AuctionId, seqNum: bigint) => Promise<void>,
  seqNum?: bigint,
):
  | { buttonType: 'end' | 'withdraw'; onClickButton: VoidFunction }
  | { buttonType: undefined; onClickButton: undefined } => {
  if (seqNum === 0n) return { buttonType: 'end', onClickButton: () => void endAuction(auctionId) };

  if (seqNum === 1n)
    return { buttonType: 'withdraw', onClickButton: () => void withdraw(auctionId, seqNum) };

  return { buttonType: undefined, onClickButton: undefined };
};

export const AuctionList = () => {
  const {
    auctionInfos,
    metadataByAssetId,
    fullSyncHeight,
    endAuction,
    withdraw,
    filter,
    setFilter,
  } = useStoreShallow(auctionListSelector);

  const filteredAuctionInfos = useMemo(
    () =>
      [...getFilteredAuctionInfos(auctionInfos, filter, fullSyncHeight)].sort(
        SORT_FUNCTIONS[filter],
      ),
    [auctionInfos, filter, fullSyncHeight],
  );

  return (
    <Card>
      <div className='mb-4 flex items-center justify-between'>
        <GradientHeader>My Auctions</GradientHeader>

        <div className='flex items-center gap-2'>
          {!!filteredAuctionInfos.length && <QueryLatestStateButton />}

          <SegmentedPicker
            value={filter}
            onChange={setFilter}
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Upcoming', value: 'upcoming' },
              { label: 'All', value: 'all' },
            ]}
          />
        </div>
      </div>

      <div className='flex flex-col gap-2'>
        {!filteredAuctionInfos.length &&
          filter === 'all' &&
          "You don't currently have any auctions."}

        {!filteredAuctionInfos.length &&
          filter === 'active' &&
          "You don't currently have any active auctions."}

        <LayoutGroup>
          {filteredAuctionInfos.map(auctionInfo => (
            <DutchAuctionComponent
              key={bech32mAuctionId(auctionInfo.id)}
              dutchAuction={auctionInfo.auction}
              inputMetadata={getMetadata(
                metadataByAssetId,
                auctionInfo.auction.description?.input?.assetId,
              )}
              outputMetadata={getMetadata(
                metadataByAssetId,
                auctionInfo.auction.description?.outputId,
              )}
              fullSyncHeight={fullSyncHeight}
              {...getButtonProps(
                auctionInfo.id,
                endAuction,
                withdraw,
                auctionInfo.auction.state?.seq,
              )}
            />
          ))}
        </LayoutGroup>
      </div>
    </Card>
  );
};
