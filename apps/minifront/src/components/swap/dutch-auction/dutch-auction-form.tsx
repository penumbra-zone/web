import { Button } from '@penumbra-zone/ui/components/ui/button';
import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { InputBlock } from '../../shared/input-block';
import { DurationSlider } from '../duration-slider';
import { Output } from '../swap-form/output';
import { TokenSwapInput } from '../token-swap-input';
import { useLoaderData } from 'react-router-dom';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

const dutchAuctionFormSelector = (state: AllSlices) => ({
  balances: state.swap.balancesResponses,
  assetIn: state.swap.assetIn,
  setAssetIn: state.swap.setAssetIn,
  assetOut: state.swap.assetOut,
  setAssetOut: state.swap.setAssetOut,
  amount: state.swap.amount,
  setAmount: state.swap.setAmount,
  onSubmit: state.swap.dutchAuction.onSubmit,
  submitButtonDisabled: state.swap.dutchAuction.txInProgress || !state.swap.amount,
});

export const DutchAuctionForm = () => {
  const {
    amount,
    setAmount,
    assetIn,
    setAssetIn,
    assetOut,
    setAssetOut,
    balances,
    onSubmit,
    submitButtonDisabled,
  } = useStoreShallow(dutchAuctionFormSelector);
  const assets = useLoaderData() as Metadata[];

  return (
    <form
      className='flex flex-col gap-4 xl:gap-3'
      onSubmit={e => {
        e.preventDefault();
        void onSubmit();
      }}
    >
      <TokenSwapInput
        label='Amount to sell'
        balances={balances}
        assetIn={assetIn}
        onChangeAssetIn={setAssetIn}
        assetOut={assetOut}
        onChangeAssetOut={setAssetOut}
        amount={amount}
        onChangeAmount={setAmount}
        assets={assets}
      />

      <InputBlock label='Output'>
        <div className='mt-2'>
          <Output />
        </div>
      </InputBlock>

      <InputBlock label='Duration'>
        <div className='mt-2'>
          <DurationSlider />
        </div>
      </InputBlock>

      <Button variant='gradient' type='submit' disabled={submitButtonDisabled}>
        Start auctions
      </Button>
    </form>
  );
};
