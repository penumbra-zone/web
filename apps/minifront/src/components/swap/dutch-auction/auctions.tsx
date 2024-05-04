import { ViewBox } from '@penumbra-zone/ui/components/ui/tx/view/viewbox';
import { useStore } from '../../../state';
import { DutchAuctionComponent } from '@penumbra-zone/ui/components/ui/dutch-auction-component';

export const Auctions = () => {
  const auctions = useStore(state => state.dutchAuction.auctions);
  return (
    <div className='flex flex-col gap-2'>
      {!auctions.length && <>No auctions</>}

      {!!auctions.length &&
        auctions.map(auction => (
          <ViewBox
            key={auction.description?.nonce.toString()}
            label='Dutch Auction'
            visibleContent={<DutchAuctionComponent dutchAuction={auction} />}
          />
        ))}
    </div>
  );
};
