import { ViewBox } from '@penumbra-zone/ui/components/ui/tx/view/viewbox';
import { AllSlices } from '../../../state';
import { DutchAuctionComponent } from '@penumbra-zone/ui/components/ui/dutch-auction-component';
import {
  AssetId,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { bech32mAssetId } from '@penumbra-zone/bech32m/passet';

const getMetadata = (metadataByAssetId: Record<string, Metadata>, assetId?: AssetId) => {
  let metadata: Metadata | undefined;
  if (assetId && (metadata = metadataByAssetId[bech32mAssetId(assetId)])) {
    return metadata;
  }

  return new Metadata({ penumbraAssetId: assetId });
};

const auctionsSelector = (state: AllSlices) => ({
  auctions: state.dutchAuction.auctions,
  metadataByAssetId: state.dutchAuction.metadataByAssetId,
});

export const Auctions = () => {
  const { auctions, metadataByAssetId } = useStoreShallow(auctionsSelector);

  return (
    <>
      <p className='mb-2 bg-text-linear bg-clip-text font-headline text-xl font-semibold leading-[30px] text-transparent md:text-2xl md:font-bold md:leading-9'>
        My auctions
      </p>

      <div className='flex flex-col gap-2'>
        {!auctions.length && "You don't currently have any auctions running."}

        {auctions.map(auction => (
          <ViewBox
            key={auction.description?.nonce.toString()}
            label='Dutch Auction'
            visibleContent={
              <DutchAuctionComponent
                dutchAuction={auction}
                inputMetadata={getMetadata(metadataByAssetId, auction.description?.input?.assetId)}
                outputMetadata={getMetadata(metadataByAssetId, auction.description?.outputId)}
              />
            }
          />
        ))}
      </div>
    </>
  );
};
