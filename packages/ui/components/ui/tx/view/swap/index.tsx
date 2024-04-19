import { ViewBox } from '../viewbox';
import { SwapView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { TransactionIdComponent } from '../transaction-id';
import { getOneWaySwapValues, isOneWaySwap } from '@penumbra-zone/types/src/swap';
import { OneWaySwap } from './one-way-swap';
import { ValueWithAddress } from '../value-with-address';
import {
  getAddressView,
  getClaimFeeFromSwapView,
  getClaimTx,
} from '@penumbra-zone/getters/src/swap-view';
import { ValueViewComponent } from '../value';
import {ValueView} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { Fee } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb';
import { ActionDetails } from '../action-details';
import { UnimplementedView } from '../unimplemented-view';

const getClaimFeeValueView = (claimFee: Fee) =>
  new ValueView({
    valueView: {
      case: 'knownAssetId',
      value: {
        amount: claimFee.amount,
      },
    },
  });

export const SwapViewComponent = ({ value }: { value: SwapView }) => {
  if (value.swapView.case === 'visible') {
    const claimFee = getClaimFeeFromSwapView(value);
    const claimTx = getClaimTx.optional()(value);
    const addressView = getAddressView.optional()(value);
    const claimFeeValueView = getClaimFeeValueView(claimFee);
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

              <ActionDetails.Row label='Fee'>
                <ValueViewComponent view={claimFeeValueView} />
              </ActionDetails.Row>

              {claimTx && (
                <ActionDetails.Row label='Swap claim transaction'>
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
    return <UnimplementedView label='Swap' />;
  }

  return <div>Invalid SwapView</div>;
};
