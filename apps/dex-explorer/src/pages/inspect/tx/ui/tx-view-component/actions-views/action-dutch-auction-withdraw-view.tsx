import { ActionDutchAuctionWithdrawView } from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';
import { ViewBox } from '../viewbox';
import { ActionDetails } from './action-details';
import { AuctionIdComponent } from './auction-id-component';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { getDisplayDenomFromView } from '@penumbra-zone/getters/value-view';

export const ActionDutchAuctionWithdrawViewComponent = ({
  value,
}: {
  value: ActionDutchAuctionWithdrawView;
}) => {
  return (
    <ViewBox
      label='Withdraw from a Dutch Auction'
      visibleContent={
        <ActionDetails>
          <ActionDetails.Row label='Auction ID'>
            <AuctionIdComponent auctionId={value.action?.auctionId} />
          </ActionDetails.Row>

          <ActionDetails.Row label='Amounts'>
            <div className='flex flex-col items-end gap-2'>
              {value.reserves.map(valueView => (
                <ValueViewComponent
                  key={getDisplayDenomFromView(valueView)}
                  valueView={valueView}
                />
              ))}
            </div>
          </ActionDetails.Row>
        </ActionDetails>
      }
    />
  );
};
