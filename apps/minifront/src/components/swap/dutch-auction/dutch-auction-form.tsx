import { Button } from '@penumbra-zone/ui/components/ui/button';
import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { InputBlock } from '../../shared/input-block';
import { DurationSlider } from './duration-slider';
import { Price } from './price';
import { TokenSwapInput } from '../token-swap-input';
import { useLoaderData } from 'react-router-dom';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

const dutchAuctionFormSelector = (state: AllSlices) => ({
  balances: state.dutchAuction.balancesResponses,
  assetIn: state.dutchAuction.assetIn,
  setAssetIn: state.dutchAuction.setAssetIn,
  assetOut: state.dutchAuction.assetOut,
  setAssetOut: state.dutchAuction.setAssetOut,
  amount: state.dutchAuction.amount,
  setAmount: state.dutchAuction.setAmount,
  onSubmit: state.dutchAuction.onSubmit,
  submitButtonDisabled: state.dutchAuction.txInProgress || !state.dutchAuction.amount,
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

      <InputBlock label='Price'>
        <div className='mt-2'>
          <Price />
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
