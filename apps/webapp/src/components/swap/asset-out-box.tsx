import { useStore } from '../../state';
import { swapSelector } from '../../state/swap';
import { AccountBalance, AssetBalance, groupByAsset } from '../../fetchers/balances';
import { Input } from '@penumbra-zone/ui';
import { AssetOutSelector } from './asset-out-selector';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';

interface AssetOutBoxProps {
  balances: AccountBalance[];
}

export const AssetOutBox = ({ balances }: AssetOutBoxProps) => {
  const { assetOut, setAssetOut } = useStore(swapSelector);

  const aggregatedBalances = balances
    .flatMap(b => b.balances)
    .reduce<AssetBalance[]>(groupByAsset, []);

  // TODO: with https://github.com/penumbra-zone/web/issues/392 convert to use `getValueViewByAccount`
  const balanceOfDenom = aggregatedBalances.find(b => b.assetId.equals(assetOut?.penumbraAssetId));
  const valueView = balanceOfDenom
    ? new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: balanceOfDenom.amount,
            metadata: new Metadata({
              display: balanceOfDenom.metadata.display,
              denomUnits: balanceOfDenom.metadata.denomUnits,
            }),
          },
        },
      })
    : new ValueView();

  return (
    <div className='flex flex-col rounded-lg border bg-background px-4 pb-5 pt-3'>
      <div className='mb-2 flex items-center justify-between gap-1 md:gap-2'>
        <p className='text-sm font-bold md:text-base'>Swap into</p>
      </div>
      <div className='flex items-center justify-between gap-4'>
        <Input
          variant='transparent'
          type='number'
          className='font-bold leading-10 md:h-8 md:w-[calc(100%-80px)] md:text-xl  xl:h-10 xl:w-[calc(100%-160px)] xl:text-3xl'
          // TODO: estimate actual swap out amount button: https://github.com/penumbra-zone/web/issues/421
          value=''
        />
        <AssetOutSelector
          balances={aggregatedBalances}
          assetOut={assetOut}
          setAssetOut={setAssetOut}
        />
      </div>
      <div className='mt-[6px] flex items-start justify-between'>
        <div />
        <div className='flex items-start gap-1'>
          <img src='./wallet.svg' alt='Wallet' className='size-5' />
          <ValueViewComponent view={valueView} />
        </div>
      </div>
    </div>
  );
};
