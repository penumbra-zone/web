import { ViewBox } from '../viewbox';
import { SwapView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { fromBaseUnitAmount } from '@penumbra-zone/types/src/amount';
import { ActionDetails } from '../action-details';
import { AddressView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { AddressViewComponent } from '../address-view';
import { TransactionIdComponent } from '../transaction-id';
import { SquareArrowRight } from 'lucide-react';
import { isOneWaySwap } from '@penumbra-zone/types/src/swap';
import { OneWaySwap } from './one-way-swap';
import { TwoWaySwap } from './two-way-swap';

export const SwapViewComponent = ({ value }: { value: SwapView }) => {
  if (value.swapView.case === 'visible') {
    const { claimFee, claimAddress } = value.swapView.value.swapPlaintext!;

    const addressView = new AddressView({
      addressView: { case: 'decoded', value: { address: claimAddress } },
    });

    const { claimTx } = value.swapView.value;

    return (
      <ViewBox
        label='Swap'
        visibleContent={
          <div className='flex flex-col gap-8'>
            {claimTx && (
              <div>
                <TransactionIdComponent
                  prefix={
                    <>
                      Swap claim
                      <SquareArrowRight size={16} className='ml-1' />
                    </>
                  }
                  transactionId={claimTx}
                  shaClassName='font-mono ml-1'
                />
              </div>
            )}

            {isOneWaySwap(value) && <OneWaySwap swapView={value} />}
            {!isOneWaySwap(value) && <TwoWaySwap swapView={value} />}

            <ActionDetails label='Claim'>
              <ActionDetails.Row label='Address'>
                <AddressViewComponent view={addressView} />
              </ActionDetails.Row>
              <ActionDetails.Row label='Fee'>
                {fromBaseUnitAmount(claimFee!.amount!, 0).toFormat()} upenumbra
              </ActionDetails.Row>
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
