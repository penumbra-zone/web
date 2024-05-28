import { Button } from '@penumbra-zone/ui/components/ui/button';
import { AllSlices } from '../../../state';
import { TokenSwapInput } from './token-swap-input';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { DurationSlider } from '../duration-slider';
import { InputBlock } from '../../shared/input-block';
import { Output } from './output';
import { Card } from '@penumbra-zone/ui/components/ui/card';
import { SimulateSwap } from './simulate-swap';
import { LayoutGroup } from 'framer-motion';
import { useId } from 'react';

const swapFormSelector = (state: AllSlices) => ({
  onSubmit:
    state.swap.duration === 'instant'
      ? state.swap.instantSwap.initiateSwapTx
      : state.swap.dutchAuction.onSubmit,
  submitButtonLabel: state.swap.duration === 'instant' ? 'Swap' : 'Start auctions',
  submitButtonDisabled: state.swap.dutchAuction.txInProgress || !state.swap.amount,
  duration: state.swap.duration,
});

export const SwapForm = () => {
  const { onSubmit, submitButtonLabel, duration, submitButtonDisabled } =
    useStoreShallow(swapFormSelector);

  const mechanismLayoutId = useId();

  return (
    <Card layout>
      <LayoutGroup>
        <form
          className='flex flex-col gap-4 xl:gap-3'
          onSubmit={e => {
            e.preventDefault();
            void onSubmit();
          }}
        >
          <TokenSwapInput />

          <InputBlock label='Speed' layout>
            <DurationSlider />
          </InputBlock>

          {duration === 'instant' ? (
            <SimulateSwap layoutId={mechanismLayoutId} />
          ) : (
            <Output layoutId={mechanismLayoutId} />
          )}

          <Button
            type='submit'
            variant='gradient'
            size='lg'
            className='mt-3 flex grow'
            disabled={submitButtonDisabled}
          >
            {submitButtonLabel}
          </Button>
        </form>
      </LayoutGroup>
    </Card>
  );
};
