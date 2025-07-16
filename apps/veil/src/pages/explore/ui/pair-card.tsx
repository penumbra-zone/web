import { ReactNode } from 'react';
import cn from 'clsx';
import Link from 'next/link';
import { shortify } from '@penumbra-zone/types/shortify';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import { round } from '@penumbra-zone/types/round';
import { Text } from '@penumbra-zone/ui/Text';
import { AssetIcon } from '@penumbra-zone/ui/AssetIcon';
import ChevronDown from './chevron-down.svg';
import { SummaryWithPrices } from '@/shared/api/server/summary';
import { useGetMetadata } from '@/shared/api/assets';
import { toValueView } from '@/shared/utils/value-view';
import { convertPriceToDisplay } from '@/shared/math/price';
import { getTradePairPath } from '@/shared/const/pages';

const getTextSign = (change: number): ReactNode => {
  if (change > 0) {
    return <ChevronDown className='inline-block size-3 rotate-180' />;
  }
  if (change < 0) {
    return <ChevronDown className='inline-block size-3' />;
  }
  return null;
};

const getColor = (change: number): string => {
  if (change > 0) {
    return 'text-success-light';
  }
  if (change < 0) {
    return 'text-destructive-light';
  }
  return 'text-neutral-light';
};

export interface PairCardProps {
  summary: SummaryWithPrices;
  isFlashing?: boolean;
}

export const PairCard = ({ summary, isFlashing }: PairCardProps) => {
  const getMetadata = useGetMetadata();
  const startMetadata = getMetadata(summary.start);
  if (!startMetadata) {
    throw new Error(`unknown asset: ${summary.start.toJsonString()}`);
  }
  const endMetadata = getMetadata(summary.end);
  if (!endMetadata) {
    throw new Error(`unknown asset: ${summary.end.toJsonString()}`);
  }
  const volumeMetadata = getMetadata(summary.volume.assetId);

  // Generate mock depth values based on volume (ascending order)
  const baseDepth = Number(
    getFormattedAmtFromValueView(toValueView({ value: summary.volume, getMetadata }))
  ) * 0.1; // Base it on 10% of volume
  
  const depths = {
    '-5%': Math.round(baseDepth * 0.2),
    '-2%': Math.round(baseDepth * 0.5),
    '-1%': Math.round(baseDepth * 0.8),
    '+1%': Math.round(baseDepth * 0.8),
    '+2%': Math.round(baseDepth * 0.5),
    '+5%': Math.round(baseDepth * 0.2),
  };

  return (
    <Link
      href={getTradePairPath(startMetadata.symbol, endMetadata.symbol)}
      className={cn(
        'col-span-5 grid cursor-pointer grid-cols-subgrid rounded-sm p-3 transition-all duration-300 hover:bg-action-hover-overlay',
        isFlashing && 'animate-pulse bg-success-light/10'
      )}
    >
      <div className='relative flex h-10 items-center gap-2 text-text-primary'>
        <div className='z-10'>
          <AssetIcon metadata={startMetadata} size='lg' />
        </div>
        <div className='-ml-4'>
          <AssetIcon metadata={endMetadata} size='lg' />
        </div>

        <Text body>
          {startMetadata.symbol}/{endMetadata.symbol}
        </Text>
      </div>

      <div className='flex h-10 flex-col items-end justify-center'>
        <span className='text-text-primary' style={{ fontFamily: 'Inter, -apple-system, system-ui, sans-serif', fontVariantNumeric: 'tabular-nums' }}>
          {round({
            value: convertPriceToDisplay(summary.price, startMetadata, endMetadata),
            decimals: 6,
          })}
        </span>
        <span className='text-xs text-text-secondary' style={{ fontFamily: 'Inter, -apple-system, system-ui, sans-serif' }}>
          {endMetadata.symbol}
        </span>
      </div>

      <div className='flex h-10 flex-col items-end justify-center'>
        <span className='text-text-primary' style={{ fontFamily: 'Inter, -apple-system, system-ui, sans-serif', fontVariantNumeric: 'tabular-nums' }}>
          {shortify(
            Number(
              getFormattedAmtFromValueView(toValueView({ value: summary.volume, getMetadata })),
            ),
          )}
        </span>
        <span className='text-xs text-text-secondary' style={{ fontFamily: 'Inter, -apple-system, system-ui, sans-serif' }}>
          {volumeMetadata?.symbol}
        </span>
      </div>

      <div className='flex h-10 items-center justify-center'>
        <div className='flex flex-col justify-center text-xs leading-tight' style={{ fontFamily: 'Inter, -apple-system, system-ui, sans-serif', fontVariantNumeric: 'tabular-nums' }}>
          <div className='flex items-center'>
            <span className='text-destructive-light/60 text-right w-10'>{shortify(depths['-1%'])}</span>
            <span className='mx-1 w-8'></span>
            <span className='text-success-light/60 text-left w-10'>{shortify(depths['+1%'])}</span>
            <span className='text-[10px] text-text-secondary ml-1.5'>±1%</span>
          </div>
          <div className='flex items-center'>
            <span className='text-destructive-light/80 text-right w-10'>{shortify(depths['-2%'])}</span>
            <span className='text-[9px] text-text-secondary/50 mx-1 w-8 text-center'>{startMetadata.symbol}</span>
            <span className='text-success-light/80 text-left w-10'>{shortify(depths['+2%'])}</span>
            <span className='text-[10px] text-text-secondary ml-1.5'>±2%</span>
          </div>
          <div className='flex items-center'>
            <span className='text-destructive-light text-right w-10'>{shortify(depths['-5%'])}</span>
            <span className='mx-1 w-8'></span>
            <span className='text-success-light text-left w-10'>{shortify(depths['+5%'])}</span>
            <span className='text-[10px] text-text-secondary ml-1.5'>±5%</span>
          </div>
        </div>
      </div>

      <div className='flex h-10 items-center justify-end'>
        <div className={cn('flex items-center', getColor(summary.priceChangePercent))}>
          {getTextSign(summary.priceChangePercent)}
          <span style={{ fontFamily: 'Inter, -apple-system, system-ui, sans-serif', fontVariantNumeric: 'tabular-nums' }}>
            {Math.abs(summary.priceChangePercent).toFixed(2)}%
          </span>
        </div>
      </div>
    </Link>
  );
};
