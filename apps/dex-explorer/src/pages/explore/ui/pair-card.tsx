import { ReactNode } from 'react';
import { Star, CandlestickChart } from 'lucide-react';
import cn from 'clsx';
import { subDays } from 'date-fns';
import Link from 'next/link';

import { shortify } from '@penumbra-zone/types/shortify';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import { round } from '@penumbra-zone/types/round';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { Density } from '@penumbra-zone/ui/Density';
import { AssetIcon } from '@penumbra-zone/ui/AssetIcon';

import { SummaryData } from '@/shared/api/server/summary/types';
import { Skeleton } from '@/shared/ui/skeleton';
import SparklineChart from './sparkline-chart.svg';
import ChevronDown from './chevron-down.svg';
import { PreviewChart } from './preview-chart';
import { useRegistryAssets } from '@/shared/api/registry';

const ShimmeringBars = () => {
  return (
    <>
      <div className='w-16 h-4 my-1'>
        <Skeleton />
      </div>
      <div className='w-10 h-4'>
        <Skeleton />
      </div>
    </>
  );
};

const getTextSign = (summary: SummaryData): ReactNode => {
  if (summary.change.sign === 'positive') {
    return <ChevronDown className='size-3 rotate-180 inline-block' />;
  }
  if (summary.change.sign === 'negative') {
    return <ChevronDown className='size-3 inline-block' />;
  }
  return null;
};

const getColor = (summary: SummaryData): string => {
  if (summary.change.sign === 'positive') {
    return 'text-success-light';
  }
  if (summary.change.sign === 'negative') {
    return 'text-destructive-light';
  }
  return 'text-neutral-light';
};

export type PairCardProps =
  | {
      loading: true;
      summary: undefined;
    }
  | {
      loading: false;
      summary: SummaryData;
    };

export const PairCard = ({ loading, summary }: PairCardProps) => {
  const today = new Date();
  const yesterday = subDays(new Date(), 1);

  const { data: assets } = useRegistryAssets();
  const usdcMetadata = assets?.find(asset => asset.symbol === 'USDC');

  return (
    <Link
      href={loading ? `/trade` : `/trade/${summary.baseAsset.symbol}/${summary.quoteAsset.symbol}`}
      className='grid grid-cols-subgrid col-span-6 p-3 rounded-sm cursor-pointer transition-colors hover:bg-action-hoverOverlay'
    >
      <div className='relative h-10 flex items-center gap-2 text-text-primary'>
        {loading ? (
          <div className='h-6 w-20'>
            <Skeleton />
          </div>
        ) : (
          <>
            <Density compact>
              <Button icon={Star} iconOnly>
                Favorite
              </Button>
            </Density>

            <div className='z-10'>
              <AssetIcon metadata={summary.baseAsset} size='lg' />
            </div>
            <div className='-ml-4'>
              <AssetIcon metadata={summary.quoteAsset} size='lg' />
            </div>

            <Text body>
              {summary.baseAsset.symbol}/{summary.quoteAsset.symbol}
            </Text>
          </>
        )}
      </div>

      <div className='h-10 flex flex-col items-end justify-center'>
        {loading ? (
          <ShimmeringBars />
        ) : (
          <>
            <Text color='text.primary'>{round({ value: summary.price, decimals: 6 })}</Text>
            <Text detail color='text.secondary'>
              {summary.quoteAsset.symbol}
            </Text>
          </>
        )}
      </div>

      <div className='h-10 flex flex-col items-end justify-center'>
        {loading ? (
          <ShimmeringBars />
        ) : (
          <>
            <Text color='text.primary'>
              {shortify(Number(getFormattedAmtFromValueView(summary.liquidity)))}
            </Text>
            <Text detail color='text.secondary'>
              {usdcMetadata?.symbol}
            </Text>
          </>
        )}
      </div>

      <div className='h-10 flex flex-col items-end justify-center'>
        {loading ? (
          <ShimmeringBars />
        ) : (
          <>
            <Text color='text.primary'>
              {shortify(Number(getFormattedAmtFromValueView(summary.directVolume)))}
            </Text>
            <Text detail color='text.secondary'>
              {usdcMetadata?.symbol}
            </Text>
          </>
        )}
      </div>

      <div className='h-10 flex items-center justify-end gap-2'>
        {loading ? (
          <>
            <div className='w-10 h-4 bg-shimmer rounded-xs' />
            <SparklineChart className='w-14 h-8' />
          </>
        ) : (
          <>
            <div className={cn('flex items-center', getColor(summary))}>
              {getTextSign(summary)}
              <Text>{summary.change.percent}%</Text>
            </div>

            <PreviewChart
              sign={summary.change.sign}
              values={summary.candles ?? []}
              dates={summary.candleTimes ?? []}
              intervals={24}
              from={yesterday}
              to={today}
            />
          </>
        )}
      </div>

      <div className='h-10 flex flex-col items-end justify-center'>
        <Density compact>
          <Button icon={CandlestickChart} iconOnly>
            Actions
          </Button>
        </Density>
      </div>
    </Link>
  );
};
