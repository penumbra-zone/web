import { ActionDutchAuctionWithdrawView } from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';
import { UnknownAction } from './unknown';

export interface DutchAuctionWithdrawActionProps {
  value: ActionDutchAuctionWithdrawView;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- unimplemented
export const DutchAuctionWithdrawAction = (_: DutchAuctionWithdrawActionProps) => {
  return <UnknownAction label='Dutch Auction Withdraw' opaque={false} />;
};
