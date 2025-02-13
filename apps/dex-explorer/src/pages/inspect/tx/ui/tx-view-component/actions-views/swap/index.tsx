import { ViewBox } from '../../viewbox';
import { SwapView } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { TransactionIdComponent } from './transaction-id';
import { getOneWaySwapValues, isOneWaySwap } from '@penumbra-zone/types/swap';
import { OneWaySwap } from './one-way-swap';
import { ValueWithAddress } from '../value-with-address';
import {
  getAddressView,
  getClaimFeeFromSwapView,
  getClaimTx,
} from '@penumbra-zone/getters/swap-view';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { ActionDetails } from '../action-details';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export const SwapViewComponent = ({
  value,
  feeValueView,
}: {
  value: SwapView;
  feeValueView: ValueView;
}) => {
  if (value.swapView.case === 'visible') {
    const claimTx = getClaimTx.optional(value);
    const addressView = getAddressView.optional(value);
    const oneWaySwap = isOneWaySwap(value) ? getOneWaySwapValues(value) : undefined;

    // The 'Fee' protobuf definition does not include assetMetadata.
    // Therefore, we manually construct it in the TransactionViewComponent
    // and pass it to the ActionViewComponent for swaps to render the prepaid claim fee.
    // A deep clone of the `feeValueView` object is necessary because objects in TypeScript
    // are passed by reference, meaning they point to the same object in memory.
    const prepaidClaimFee = feeValueView.clone();
    if (prepaidClaimFee.valueView.value) {
      prepaidClaimFee.valueView.value.amount = getClaimFeeFromSwapView(value).amount;
    }

    return (
      <ViewBox
        label='Swap'
        visibleContent={
          <div className='flex flex-col gap-4'>
            <ValueWithAddress addressView={addressView} label='to'>
              {oneWaySwap && <OneWaySwap input={oneWaySwap.input} output={oneWaySwap.output} />}
              {!oneWaySwap && <>Two-way swaps are not supported in this UI.</>}
            </ValueWithAddress>

            <ActionDetails>
              {oneWaySwap?.unfilled && (
                <ActionDetails.Row label='Unfilled'>
                  <ValueViewComponent valueView={oneWaySwap.unfilled} />
                </ActionDetails.Row>
              )}

              <ActionDetails.Row label='Swap Claim Fee'>
                <div className='font-mono'>
                  <ValueViewComponent valueView={prepaidClaimFee} />
                </div>
              </ActionDetails.Row>

              {claimTx && (
                <ActionDetails.Row label='Swap Claim Transaction'>
                  <TransactionIdComponent transactionId={claimTx} />
                </ActionDetails.Row>
              )}
            </ActionDetails>
          </div>
        }
      />
    );
  }

  if (value.swapView.case === 'opaque') {
    const oneWaySwap = isOneWaySwap(value) ? getOneWaySwapValues(value) : undefined;

    return (
      <ViewBox
        label='Swap'
        visibleContent={
          <div className='flex flex-col gap-4'>
            {oneWaySwap && <OneWaySwap input={oneWaySwap.input} output={oneWaySwap.output} />}
            {!oneWaySwap && <>Two-way swaps are not supported in this UI.</>}
          </div>
        }
      />
    );
  }

  return <div>Invalid SwapView</div>;
};
