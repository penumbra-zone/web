import { ActionDutchAuctionEnd } from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';
import { ViewBox } from '../viewbox';
import { AuctionIdComponent } from './auction-id-component';
import { ActionDetails } from './action-details';

export const ActionDutchAuctionEndComponent = ({ value }: { value: ActionDutchAuctionEnd }) => {
  return (
    <ViewBox
      label='End a Dutch Auction'
      visibleContent={
        <ActionDetails>
          <ActionDetails.Row label='Auction ID'>
            <AuctionIdComponent auctionId={value.auctionId} />
          </ActionDetails.Row>
        </ActionDetails>
      }
    />
  );
};
