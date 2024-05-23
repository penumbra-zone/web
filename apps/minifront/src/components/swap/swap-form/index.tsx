import { Button } from '@penumbra-zone/ui/components/ui/button';
import { useLoaderData } from 'react-router-dom';
import { AllSlices } from '../../../state';
import { swapValidationErrors } from '../../../state/swap/instant-swap';
import { SwapLoaderResponse } from '../swap-loader';
import { SimulateSwapButton } from './simulate-swap-button';
import { SimulateSwapResult } from './simulate-swap-result';
import { TokenSwapInput } from '../token-swap-input';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { DurationSlider } from '../duration-slider';
import { InputBlock } from '../../shared/input-block';

const swapFormSelector = (state: AllSlices) => ({
  assetIn: state.swap.assetIn,
  setAssetIn: state.swap.setAssetIn,
  assetOut: state.swap.assetOut,
  setAssetOut: state.swap.setAssetOut,
  amount: state.swap.amount,
  setAmount: state.swap.setAmount,
  initiateSwapTx: state.swap.instantSwap.initiateSwapTx,
  txInProgress: state.swap.instantSwap.txInProgress,
  duration: state.swap.duration,
});

export const SwapForm = () => {
  const { assetBalances, swappableAssets } = useLoaderData() as SwapLoaderResponse;
  const {
    assetIn,
    setAssetIn,
    assetOut,
    setAssetOut,
    amount,
    setAmount,
    initiateSwapTx,
    txInProgress,
    duration,
  } = useStoreShallow(swapFormSelector);
  const validationErrs = useStoreShallow(swapValidationErrors);

  return (
    <form
      className='flex flex-col gap-4 xl:gap-3'
      onSubmit={e => {
        e.preventDefault();
        void initiateSwapTx();
      }}
    >
      <TokenSwapInput
        label='Amount to swap'
        assetIn={assetIn}
        onChangeAssetIn={setAssetIn}
        assetOut={assetOut}
        onChangeAssetOut={setAssetOut}
        assets={swappableAssets}
        balances={assetBalances}
        amount={amount}
        onChangeAmount={setAmount}
      />

      <InputBlock label='Duration'>
        <div className='mt-2'>
          <DurationSlider />
        </div>
      </InputBlock>

      <div className='mt-3 flex gap-2'>
        {duration === 'instant' && <SimulateSwapButton />}

        <Button
          type='submit'
          variant='gradient'
          size='lg'
          className='grow'
          disabled={txInProgress || Object.values(validationErrs).find(Boolean)}
        >
          Swap
        </Button>
      </div>

      {duration === 'instant' && <SimulateSwapResult />}
    </form>
  );
};
