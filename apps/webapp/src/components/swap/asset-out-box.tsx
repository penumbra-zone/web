import { useStore } from '../../state';
import { swapSelector } from '../../state/swap';
import { AssetBalance } from '../../fetchers/balances';
import { Button } from '@penumbra-zone/ui';
import { AssetOutSelector } from './asset-out-selector';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { groupByAsset } from '../../fetchers/balances/by-asset.ts';

const findMatchingBalance = (
  denom: Metadata | undefined,
  balances: AssetBalance[],
): ValueView | undefined => {
  if (!denom?.penumbraAssetId) return undefined;

  return balances.reduce(groupByAsset, []).find(v => {
    if (v.valueView.case !== 'knownAssetId') return false;
    return v.valueView.value.metadata?.penumbraAssetId?.equals(denom.penumbraAssetId);
  });
};

interface AssetOutBoxProps {
  balances: AssetBalance[];
}

export const AssetOutBox = ({ balances }: AssetOutBoxProps) => {
  const { assetOut, setAssetOut, simulateSwap, simulateOutResult } = useStore(swapSelector);

  const matchingBalance = findMatchingBalance(assetOut, balances);

  return (
    <div className='flex flex-col rounded-lg border bg-background px-4 pb-5 pt-3'>
      <div className='mb-2 flex items-center justify-between gap-1 md:gap-2'>
        <p className='text-sm font-bold md:text-base'>Swap into</p>
      </div>
      <div className='flex items-center justify-between gap-4'>
        {simulateOutResult ? (
          <ValueViewComponent view={simulateOutResult} showDenom={false} />
        ) : (
          <Button
            variant='secondary'
            className='w-32 md:h-9'
            onClick={e => {
              e.preventDefault();
              void simulateSwap();
            }}
          >
            estimate swap
          </Button>
        )}
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
