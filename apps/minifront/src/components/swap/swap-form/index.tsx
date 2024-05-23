import { Button } from '@penumbra-zone/ui/components/ui/button';
import { useLoaderData } from 'react-router-dom';
import { AllSlices } from '../../../state';
import { SwapLoaderResponse } from '../swap-loader';
import { SimulateSwapButton } from './simulate-swap-button';
import { SimulateSwapResult } from './simulate-swap-result';
import { TokenSwapInput } from './token-swap-input';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { DurationSlider } from '../duration-slider';
import { InputBlock } from '../../shared/input-block';
import { Output } from './output';
import { Card } from '@penumbra-zone/ui/components/ui/card';

const swapFormSelector = (state: AllSlices) => ({
  onSubmit:
    state.swap.duration === 'instant'
      ? state.swap.instantSwap.initiateSwapTx
      : state.swap.dutchAuction.onSubmit,
  submitButtonLabel: state.swap.duration === 'instant' ? 'Swap' : 'Start auctions',
  submitButtonDisabled: state.swap.dutchAuction.txInProgress || !state.swap.amount,
  initiateSwapTx: state.swap.instantSwap.initiateSwapTx,
  duration: state.swap.duration,
});

export const SwapForm = () => {
  const { swappableAssets } = useLoaderData() as SwapLoaderResponse;
  const { onSubmit, submitButtonLabel, duration, submitButtonDisabled } =
    useStoreShallow(swapFormSelector);

  return (
    <Card>
      <form
        className='flex flex-col gap-4 xl:gap-3'
        onSubmit={e => {
          e.preventDefault();
          void onSubmit();
        }}
      >
        <TokenSwapInput assets={swappableAssets} />

        <InputBlock label='Duration'>
          <div className='mt-2'>
            <DurationSlider />
          </div>
        </InputBlock>

        {duration !== 'instant' && (
          <InputBlock label='Output'>
            <div className='mt-2'>
              <Output />
            </div>
          </InputBlock>
        )}

        <div className='mt-3 flex gap-2'>
          {duration === 'instant' && <SimulateSwapButton />}

          <Button
            type='submit'
            variant='gradient'
            size='lg'
            className='grow'
            disabled={submitButtonDisabled}
          >
            {submitButtonLabel}
          </Button>
        </div>

        {duration === 'instant' && <SimulateSwapResult />}
      </form>
    </Card>
  );
};
