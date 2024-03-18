import { ViewBox } from './viewbox';
import { SwapView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { fromBaseUnitAmount, joinLoHiAmount } from '@penumbra-zone/types/src/amount';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/src/base64';
import { ActionDetails } from './action-details';
import { AddressView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { AddressViewComponent } from './address-view';

export const SwapViewComponent = ({ value }: { value: SwapView }) => {
  if (value.swapView.case === 'visible') {
    const { tradingPair, delta1I, delta2I, claimFee, claimAddress } =
      value.swapView.value.swapPlaintext!;

    const addressView = new AddressView({
      addressView: { case: 'decoded', value: { address: claimAddress } },
    });

    return (
      <ViewBox
        label='Swap'
        visibleContent={
          <div className='flex flex-col gap-8'>
            <ActionDetails label='Asset 1'>
              <ActionDetails.Row label='ID' truncate>
                {uint8ArrayToBase64(tradingPair!.asset1!.inner)}
              </ActionDetails.Row>
              <ActionDetails.Row label='Amount'>
                {joinLoHiAmount(delta1I!).toString()}
              </ActionDetails.Row>
            </ActionDetails>

            <ActionDetails label='Asset 2'>
              <ActionDetails.Row label='ID' truncate>
                {uint8ArrayToBase64(tradingPair!.asset2!.inner)}
              </ActionDetails.Row>
              <ActionDetails.Row label='Amount'>
                {joinLoHiAmount(delta2I!).toString()}
              </ActionDetails.Row>
            </ActionDetails>

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
