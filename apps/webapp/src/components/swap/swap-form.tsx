import { Button } from '@penumbra-zone/ui';
import { useToast } from '@penumbra-zone/ui/components/ui/use-toast';
import InputToken from '../shared/input-token';
import { useLoaderData } from 'react-router-dom';
import { AssetBalance } from '../../fetchers/balances';
import { useStore } from '../../state';
import { swapSelector } from '../../state/swap';
import { AssetOutBox } from './asset-out-box';

export const SwapForm = () => {
  const assetBalances = useLoaderData() as AssetBalance[];
  const { toast } = useToast();
  const { assetIn, setAssetIn, amount, setAmount, initiateSwapTx } = useStore(swapSelector);

  return (
    <form
      className='flex flex-col gap-4 xl:gap-3'
      onSubmit={e => {
        e.preventDefault();
        void initiateSwapTx(toast);
      }}
    >
      <InputToken
        label='Amount to swap'
        placeholder='Enter an amount'
        className='mb-1'
        selection={assetIn}
        setSelection={setAssetIn}
        value={amount}
        onChange={e => {
          if (Number(e.target.value) < 0) return;
          setAmount(e.target.value);
        }}
        validations={[]}
        balances={assetBalances}
      />
      <AssetOutBox balances={assetBalances} />
      <Button type='submit' variant='gradient' className='mt-3' size='lg' disabled={false}>
        Swap
      </Button>
    </form>
  );
};
