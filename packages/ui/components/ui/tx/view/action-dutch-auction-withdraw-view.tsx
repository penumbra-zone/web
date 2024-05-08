import { ActionDutchAuctionWithdrawView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1alpha1/auction_pb';
import { ViewBox } from './viewbox';
import { ActionDetails } from './action-details';
import { AuctionIdComponent } from '../../auction-id-component';
import { ValueViewComponent } from './value';
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
                <ValueViewComponent key={getDisplayDenomFromView(valueView)} view={valueView} />
              ))}
            </div>
          </ActionDetails.Row>
        </ActionDetails>
      }
    />
  );
};
