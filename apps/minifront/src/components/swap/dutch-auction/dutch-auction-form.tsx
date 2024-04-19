import { Button } from '@penumbra-zone/ui/components/ui/button';
import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { InputBlock } from '../../shared/input-block';
import InputToken from '../../shared/input-token';
import { DurationSlider } from './duration-slider';
import { Prices } from './prices';

const dutchAuctionFormSelector = (state: AllSlices) => ({
  balances: state.dutchAuction.balancesResponses,
  assetIn: state.dutchAuction.assetIn,
  setAssetIn: state.dutchAuction.setAssetIn,
  amount: state.dutchAuction.amount,
  setAmount: state.dutchAuction.setAmount,
  onSubmit: state.dutchAuction.onSubmit,
  submitButtonDisabled: state.dutchAuction.txInProgress || !state.dutchAuction.amount,
});

export const DutchAuctionForm = () => {
  const { amount, setAmount, assetIn, setAssetIn, balances, onSubmit, submitButtonDisabled } =
    useStoreShallow(dutchAuctionFormSelector);

  return (
    <form
      className='flex flex-col gap-4 xl:gap-3'
      onSubmit={e => {
        e.preventDefault();
        void onSubmit();
      }}
    >
      <InputToken
        label='Amount to sell'
        balances={balances}
        selection={assetIn}
        setSelection={setAssetIn}
        value={amount}
        onChange={e => {
          if (Number(e.target.value) < 0) return;
          setAmount(e.target.value);
        }}
        placeholder='Enter an amount'
      />

      <InputBlock label='Duration'>
        <div className='pt-2'>
          <DurationSlider />
        </div>
      </InputBlock>

      <InputBlock label='Price'>
        <div className='pt-2'>
          <Prices />
        </div>
      </InputBlock>

      <Button variant='gradient' type='submit' disabled={submitButtonDisabled}>
        Start auctions
      </Button>
    </form>
  );
};
