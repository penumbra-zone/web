import { SwapClaimView } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { UnknownAction } from './unknown';

export interface SwapClaimActionProps {
  value: SwapClaimView;
}

export const SwapClaimAction = ({ value }: SwapClaimActionProps) => {
  return <UnknownAction label='Swap Claim' opaque={value.swapClaimView.case === 'opaque'} />;
};
