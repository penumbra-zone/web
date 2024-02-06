import { useStore } from '../../state';
import { swapSelector } from '../../state/swap';
import { AssetBalance } from '../../fetchers/balances';
import { Input } from '@penumbra-zone/ui';
import { AssetOutSelector } from './asset-out-selector';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { groupByAsset } from '../../fetchers/balances/by-asset.ts';

const findMatchingBalance = (
  denom: Metadata | undefined,
  balances: AssetBalance[],
): ValueView | undefined => {
  if (!denom?.penumbraAssetId) return undefined;
  const grouped = balances.reduce(groupByAsset, []);
  console.log(grouped);

  return balances.reduce(groupByAsset, []).find(v => {
    if (v.valueView.case !== 'knownAssetId') return false;
    return v.valueView.value.metadata?.penumbraAssetId?.equals(denom.penumbraAssetId);
  });
};

interface AssetOutBoxProps {
  balances: AssetBalance[];
}

export const AssetOutBox = ({ balances }: AssetOutBoxProps) => {
  const { assetOut, setAssetOut } = useStore(swapSelector);

  const matchingBalance = findMatchingBalance(assetOut, balances);

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
        <AssetOutSelector balances={balances} assetOut={assetOut} setAssetOut={setAssetOut} />
      </div>
      <div className='mt-[6px] flex items-start justify-between'>
        <div />
        <div className='flex items-start gap-1'>
          <img src='./wallet.svg' alt='Wallet' className='size-5' />
          {matchingBalance && <ValueViewComponent view={matchingBalance} />}
        </div>
      </div>
    </div>
  );
};
