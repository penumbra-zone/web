import { ViewBox } from '../viewbox';
import { SwapView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { TransactionIdComponent } from '../transaction-id';
import { isOneWaySwap } from '@penumbra-zone/types/src/swap';
import { OneWaySwap } from './one-way-swap';
import { TwoWaySwap } from './two-way-swap';
import { ValueWithAddress } from '../value-with-address';
import {
  getAddressView,
  getClaimFeeFromSwapView,
  getClaimTx,
} from '@penumbra-zone/getters/src/swap-view';
import { ValueViewComponent } from '../value';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { STAKING_TOKEN_METADATA } from '@penumbra-zone/constants/src/assets';
import { Fee } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb';
import { ActionDetails } from '../action-details';

const getClaimFeeValueView = (claimFee: Fee) =>
  new ValueView({
    valueView: {
      case: 'knownAssetId',
      value: {
        amount: claimFee.amount,
        metadata: STAKING_TOKEN_METADATA,
      },
    },
  });

export const SwapViewComponent = ({ value }: { value: SwapView }) => {
  if (value.swapView.case === 'visible') {
    const claimFee = getClaimFeeFromSwapView(value);
    const claimTx = getClaimTx.optional()(value);
    const addressView = getAddressView.optional()(value);
    const claimFeeValueView = getClaimFeeValueView(claimFee);

    return (
      <ViewBox
        label='Swap'
        visibleContent={
          <div className='flex flex-col gap-4'>
            <ValueWithAddress addressView={addressView} label='to'>
              {isOneWaySwap(value) ? (
                <OneWaySwap swapView={value} />
              ) : (
                <TwoWaySwap swapView={value} />
              )}
            </ValueWithAddress>

            <ActionDetails>
              <ActionDetails.Row label='Fee'>
                <ValueViewComponent view={claimFeeValueView} />
              </ActionDetails.Row>

              {claimTx && (
                <ActionDetails.Row label='Swap claim'>
                  <TransactionIdComponent transactionId={claimTx} shaClassName='font-mono ml-1' />
                </ActionDetails.Row>
              )}
            </ActionDetails>
          </div>
        }
      />
    );
  }

  if (value.swapView.case === 'opaque') {
    return <ViewBox label='Swap' />;
  }

  return <div>Invalid SwapView</div>;
};
