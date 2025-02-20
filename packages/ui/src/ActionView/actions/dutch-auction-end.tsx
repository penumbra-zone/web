import { UnknownAction } from './unknown';
import { ActionDutchAuctionEnd } from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';

export interface DutchAuctionEndActionProps {
  value: ActionDutchAuctionEnd;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- unimplemented
export const DutchAuctionEndAction = (_: DutchAuctionEndActionProps) => {
  return <UnknownAction label='Dutch Auction End' opaque={false} />;
};
