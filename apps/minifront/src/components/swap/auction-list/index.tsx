import { ViewBox } from '@penumbra-zone/ui/components/ui/tx/view/viewbox';
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
  const { auctionInfos, metadataByAssetId, fullSyncHeight, endAuction, withdraw } =
    useStoreShallow(auctionListSelector);

  return (
    <Card>
      <div className='mb-2 flex items-center justify-between'>
        <GradientHeader>My Auctions</GradientHeader>
        {!!auctionInfos.length && <QueryLatestStateButton />}
      </div>

      <div className='flex flex-col gap-2'>
        {!auctionInfos.length && "You don't currently have any auctions running."}

        {auctionInfos.map(auctionInfo => (
          <ViewBox
            key={bech32mAuctionId(auctionInfo.id)}
            label='Dutch Auction'
            visibleContent={
              <DutchAuctionComponent
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
            }
          />
        ))}
      </div>
    </Card>
  );
};
