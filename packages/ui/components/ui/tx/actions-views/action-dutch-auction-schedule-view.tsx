import {
  ActionDutchAuctionScheduleView,
  DutchAuction,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import { DutchAuctionComponent } from '../../dutch-auction-component';
import { ViewBox } from '../viewbox';

export const ActionDutchAuctionScheduleViewComponent = ({
  value,
}: {
  value: ActionDutchAuctionScheduleView;
}) => {
  return (
    <ViewBox
      label='Schedule a Dutch Auction'
      visibleContent={
        <DutchAuctionComponent
          dutchAuction={new DutchAuction({ description: value.action?.description })}
          inputMetadata={value.inputMetadata}
          outputMetadata={value.outputMetadata}
        />
      }
    />
  );
};
