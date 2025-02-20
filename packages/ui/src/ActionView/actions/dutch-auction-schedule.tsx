import { ActionDutchAuctionScheduleView } from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';
import { UnknownAction } from './unknown';

export interface DutchAuctionScheduleActionProps {
  value: ActionDutchAuctionScheduleView;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- unimplemented
export const DutchAuctionScheduleAction = (_: DutchAuctionScheduleActionProps) => {
  return <UnknownAction label='Dutch Auction Schedule' opaque={false} />;
};
