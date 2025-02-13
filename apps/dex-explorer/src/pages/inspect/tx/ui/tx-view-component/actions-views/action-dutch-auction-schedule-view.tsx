import {
  ActionDutchAuctionScheduleView,
  DutchAuction,
} from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';
import { DutchAuctionComponent } from './dutch-auction-component';
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
          auctionId={value.auctionId}
        />
      }
    />
  );
};
