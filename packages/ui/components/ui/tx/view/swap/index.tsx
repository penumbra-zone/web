import { ViewBox } from '../viewbox';
import { SwapView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { TransactionIdComponent } from '../transaction-id';
import { getOneWaySwapValues, isOneWaySwap } from '@penumbra-zone/types/swap';
import { OneWaySwap } from './one-way-swap';
import { ValueWithAddress } from '../value-with-address';
import {
  getAddressView,
  getClaimFeeFromSwapView,
  getClaimTx,
} from '@penumbra-zone/getters/swap-view';
import { ValueViewComponent } from '../value';
import { ActionDetails } from '../action-details';
import { joinLoHiAmount } from '@penumbra-zone/types/amount';
import { getAmount } from '@penumbra-zone/getters/fee';

export const SwapViewComponent = ({ value }: { value: SwapView }) => {
  if (value.swapView.case === 'visible') {
    const claimFee = getClaimFeeFromSwapView(value);
    const claimTx = getClaimTx.optional()(value);
    const addressView = getAddressView.optional()(value);
    const oneWaySwap = isOneWaySwap(value) ? getOneWaySwapValues(value) : undefined;

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
                  <ValueViewComponent view={oneWaySwap.unfilled} />
                </ActionDetails.Row>
              )}

              <ActionDetails.Row label='Prepaid Claim Fee'>
                <div className='font-mono'>
                  {joinLoHiAmount(getAmount(claimFee)).toString()} upenumbra
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
