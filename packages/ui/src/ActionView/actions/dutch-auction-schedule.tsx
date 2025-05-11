import { ActionDutchAuctionScheduleView } from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';
import { UnknownAction } from './unknown';

export interface DutchAuctionScheduleActionProps {
  value: ActionDutchAuctionScheduleView;
}

export const DutchAuctionScheduleAction = (_: DutchAuctionScheduleActionProps) => {
  return <UnknownAction label='Dutch Auction Schedule' opaque={false} />;
};
