import { ViewBox } from './viewbox';
import { SwapView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1alpha1/dex_pb';
import {
  bech32Address,
  fromBaseUnitAmount,
  joinLoHiAmount,
  uint8ArrayToBase64,
} from '@penumbra-zone/types';

export const SwapViewComponent = ({ value }: { value: SwapView }) => {
  if (value.swapView.case === 'visible') {
    const { tradingPair, delta1I, delta2I, claimFee, claimAddress } =
      value.swapView.value.swapPlaintext!;

    const encodedAddress = bech32Address(claimAddress!);

    return (
      <ViewBox
        label='Swap'
        visibleContent={
          <div className='flex flex-col gap-2'>
            <div>
              <b>Asset 1:</b>
              <div className='ml-5'>
                <b>ID: </b>
                {uint8ArrayToBase64(tradingPair!.asset1!.inner)}
              </div>
              <div className='ml-5'>
                <b>Amount: </b>
                <span className='font-mono'>{joinLoHiAmount(delta1I!).toString()}</span>
              </div>
            </div>
            <div>
              <b>Asset 2:</b>
              <div className='ml-5'>
                <b>ID: </b>
                {uint8ArrayToBase64(tradingPair!.asset2!.inner)}
              </div>
              <div className='ml-5'>
                <b>Amount: </b>
                <span className='font-mono'>{joinLoHiAmount(delta2I!).toString()}</span>
              </div>
            </div>
            <div>
              <b>Claim:</b>
              <div className='ml-5'>
                <b>Address: </b>
                {encodedAddress}
              </div>
              <div className='ml-5'>
                <b>Fee: </b>
                <span className='font-mono'>
                  {fromBaseUnitAmount(claimFee!.amount!, 1).toFormat()} upenumbra
                </span>
              </div>
            </div>
          </div>
        }
      />
    );
  }

  if (value.swapView.case === 'opaque') {
    return <ViewBox label='Swap' />;
  }

  return <div>Invalid SpendView</div>;
};
