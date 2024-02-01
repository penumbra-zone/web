import { Card } from '@penumbra-zone/ui';
import { LoaderFunction } from 'react-router-dom';
import { AssetBalance, getAssetBalances } from '../../fetchers/balances';
import { useStore } from '../../state';
import { throwIfExtNotInstalled } from '../../fetchers/is-connected';
import { EduInfoCard } from '../shared/edu-panels/edu-info-card';
import { EduPanel } from '../shared/edu-panels/content';
import { SwapForm } from './swap-form';
import { localAssets } from '@penumbra-zone/constants';

export const SwapLoader: LoaderFunction = async (): Promise<AssetBalance[]> => {
  throwIfExtNotInstalled();
  const balancesByAccount = await getAssetBalances();

  // set initial denom in if there is an available balance
  if (balancesByAccount[0]) {
    useStore.setState(state => {
      state.swap.assetIn = balancesByAccount[0];
      state.swap.assetOut = localAssets[0];
    });
  }

  return balancesByAccount;
};

export const SwapLayout = () => {
  return (
    <div className='relative mx-auto grid gap-6 md:grid-cols-2 md:gap-4 xl:max-w-[1276px] xl:grid-cols-3 xl:gap-5'>
      <div className='hidden xl:order-1 xl:block' />
      <Card gradient className='order-2 row-span-2 flex-1 p-5 md:order-1 md:p-4 xl:p-5'>
        <SwapForm />
      </Card>
      <EduInfoCard
        className='order-1 md:order-2'
        src='./receive-gradient.svg'
        label='Swap me'
        content={EduPanel.TEMP_FILLER}
      />
    </div>
  );
};
