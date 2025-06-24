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
import ChevronDown from './chevron-down.svg';
import { PreviewChart } from './preview-chart';
import { SummaryWithPrices } from '@/shared/api/server/summary';
import { useGetMetadata } from '@/shared/api/assets';
import { toValueView } from '@/shared/utils/value-view';
import { convertPriceToDisplay } from '@/shared/math/price';
import { getTradePairPath } from '@/shared/const/pages';

const getTextSign = (change: number): ReactNode => {
  if (change > 0) {
    return <ChevronDown className='size-3 rotate-180 inline-block' />;
  }
  if (change < 0) {
    return <ChevronDown className='size-3 inline-block' />;
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
}

export const PairCard = ({ summary }: PairCardProps) => {
  const today = new Date();
  const yesterday = subDays(new Date(), 1);

  const getMetadata = useGetMetadata();
  const startMetadata = getMetadata(summary.start);
  if (!startMetadata) {
    throw new Error(`unknown asset: ${summary.start.toJsonString()}`);
  }
  const endMetadata = getMetadata(summary.end);
  if (!endMetadata) {
    throw new Error(`unknown asset: ${summary.end.toJsonString()}`);
  }
  const liquidityMetadata = getMetadata(summary.liquidity.assetId);
  const volumeMetadata = getMetadata(summary.volume.assetId);

  return (
    <Link
      href={getTradePairPath(startMetadata.symbol, endMetadata.symbol)}
      className='grid grid-cols-subgrid col-span-6 p-3 rounded-sm cursor-pointer transition-colors hover:bg-action-hoverOverlay'
    >
      <div className='relative h-10 flex items-center gap-2 text-text-primary'>
        <Density compact>
          <Button icon={Star} iconOnly>
            Favorite
          </Button>
        </Density>

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

      <div className='h-10 flex flex-col items-end justify-center'>
        <Text color='text.primary'>
          {round({
            value: convertPriceToDisplay(summary.price, startMetadata, endMetadata),
            decimals: 6,
          })}
        </Text>
        <Text detail color='text.secondary'>
          {endMetadata.symbol}
        </Text>
      </div>

      <div className='h-10 flex flex-col items-end justify-center'>
        <Text color='text.primary'>
          {shortify(
            Number(
              getFormattedAmtFromValueView(toValueView({ value: summary.liquidity, getMetadata })),
            ),
          )}
        </Text>
        <Text detail color='text.secondary'>
          {liquidityMetadata?.symbol}
        </Text>
      </div>

      <div className='h-10 flex flex-col items-end justify-center'>
        <Text color='text.primary'>
          {shortify(
            Number(
              getFormattedAmtFromValueView(toValueView({ value: summary.volume, getMetadata })),
            ),
          )}
        </Text>
        <Text detail color='text.secondary'>
          {volumeMetadata?.symbol}
        </Text>
      </div>

      <div className='h-10 flex items-center justify-end gap-2'>
        <div className={cn('flex items-center', getColor(summary.priceChangePercent))}>
          {getTextSign(summary.priceChangePercent)}
          <Text>{summary.priceChangePercent.toFixed(2)}%</Text>
        </div>

        <PreviewChart
          sign={summary.priceChangePercent}
          values={summary.recentPrices.map(x => x[1])}
          dates={summary.recentPrices.map(x => x[0])}
          intervals={24}
          from={yesterday}
          to={today}
        />
      </div>

      <div className='flex h-10 flex-col items-end justify-center'>
        <Density compact>
          <Button icon={CandlestickChart} iconOnly>
            Actions
          </Button>
        </Density>
      </div>
    </Link>
  );
};
