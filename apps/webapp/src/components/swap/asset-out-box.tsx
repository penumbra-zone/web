import { useStore } from '../../state';
import { swapSelector } from '../../state/swap';
import {
  buttonVariants,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@penumbra-zone/ui';
import { AssetOutSelector } from './asset-out-selector';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { groupByAsset } from '../../fetchers/balances/by-asset';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import {Amount} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb";

const findMatchingBalance = (
  metadata: Metadata | undefined,
  balances: BalancesResponse[],
): ValueView | undefined => {
  if (!metadata?.penumbraAssetId) return undefined;

  const foundMatch = balances.reduce(groupByAsset, []).find(v => {
    if (v.valueView.case !== 'knownAssetId') return false;
    return v.valueView.value.metadata?.penumbraAssetId?.equals(metadata.penumbraAssetId);
  });

  if (!foundMatch) {
    return new ValueView({
      valueView: { case: 'knownAssetId', value: { metadata, amount: new Amount() } },
    });
  }

  return foundMatch;
};

interface AssetOutBoxProps {
  balances: BalancesResponse[];
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
          <ValueViewComponent view={simulateOutResult} showDenom={false} showIcon={false} />
        ) : (
          <EstimateButton simulateFn={simulateSwap} />
        )}
        <AssetOutSelector balances={balances} assetOut={assetOut} setAssetOut={setAssetOut} />
      </div>
      <div className='mt-[6px] flex items-start justify-between'>
        <div />
        <div className='flex items-start gap-1'>
          <img src='./wallet.svg' alt='Wallet' className='size-5' />
          <ValueViewComponent view={matchingBalance} showIcon={false} />
        </div>
      </div>
    </div>
  );
};

const EstimateButton = ({ simulateFn }: { simulateFn: () => Promise<void> }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <div
          // Nested buttons are not allowed. Manually passing button classes.
          className={cn(buttonVariants({ variant: 'secondary' }), 'w-32 md:h-9')}
          onClick={e => {
            e.preventDefault();
            void simulateFn();
          }}
        >
          estimate swap
        </div>
      </TooltipTrigger>
      <TooltipContent side='bottom' className='w-60'>
        <p>
          Privacy note: This makes a request to your config&apos;s grpc node to simulate a swap of
          these assets. That means you are possibly revealing your intent to this node.
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
