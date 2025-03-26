import { ActionDutchAuctionWithdrawView } from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';
import { UnknownAction } from './unknown';

export interface DutchAuctionWithdrawActionProps {
  value: ActionDutchAuctionWithdrawView;
}

export const DutchAuctionWithdrawAction = (_: DutchAuctionWithdrawActionProps) => {
  return <UnknownAction label='Dutch Auction Withdraw' opaque={false} />;
};
