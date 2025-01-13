import { ReactNode } from 'react';
import cn from 'clsx';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Text } from '@penumbra-zone/ui/Text';
import { Skeleton } from '@/shared/ui/skeleton';
import { useSummary } from '../api/use-summary';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { round } from '@penumbra-zone/types/round';
import { Density } from '@penumbra-zone/ui/Density';
import { SummaryData } from '@/shared/api/server/summary/types.ts';
import { BlockchainError } from '@/shared/ui/blockchain-error';

const SummaryCard = ({
  title,
  loading,
  children,
}: {
  title: string;
  loading?: boolean;
  children: ReactNode;
}) => {
  const [parent] = useAutoAnimate();

  return (
    <div ref={parent} className='flex flex-col gap-[2px]'>
      {loading ? (
        <>
          <div className='h-4 w-10'>
            <Skeleton />
          </div>
          <div className='h-4 w-[4.5rem]'>
            <Skeleton />
          </div>
        </>
      ) : (
        <>
          <Text detail color='text.secondary' whitespace='nowrap'>
            {title}
          </Text>
          {children}
        </>
      )}
    </div>
  );
};

export const Summary = () => {
  const { data, isLoading, error } = useSummary('1d');

  if (error) {
    return (
      <SummaryCard title=''>
        <BlockchainError />
      </SummaryCard>
    );
  }

  return (
    <div className='flex flex-wrap items-center gap-x-4 gap-y-2'>
      <SummaryCard title='Last price' loading={isLoading}>
        <Text detail color='text.primary'>
          {data && 'price' in data ? round({ value: data.price, decimals: 6 }) : '-'}
        </Text>
      </SummaryCard>
      <SummaryCard title='24h Change' loading={isLoading}>
        {data && 'noData' in data && (
          <Text detail color='text.primary'>
            -
          </Text>
        )}
        {data && 'change' in data && (
          <div className={cn('flex items-center gap-1', getColor(data, false))}>
            <Text detail>{round({ value: data.change.value, decimals: 6 })}</Text>
            <span
              className={cn('flex h-4 px-1 rounded-full text-success-dark', getColor(data, true))}
            >
              <Text detail>
                {getTextSign(data)}
                {data.change.percent}%
              </Text>
            </span>
          </div>
        )}
      </SummaryCard>
      <SummaryCard title='24h High' loading={isLoading}>
        <Text detail color='text.primary'>
          {data && 'high' in data ? round({ value: data.high, decimals: 6 }) : '-'}
        </Text>
      </SummaryCard>
      <SummaryCard title='24h Low' loading={isLoading}>
        <Text detail color='text.primary'>
          {data && 'low' in data ? round({ value: data.low, decimals: 6 }) : '-'}
        </Text>
      </SummaryCard>
      <SummaryCard title='24h Volume' loading={isLoading}>
        {data && 'directVolume' in data ? (
          <Density compact>
            <ValueViewComponent valueView={data.directVolume} context='table' abbreviate />
          </Density>
        ) : (
          <Text detail color='text.primary'>
            -
          </Text>
        )}
      </SummaryCard>
    </div>
  );
};

const getTextSign = (res: SummaryData) => {
  if (res.change.sign === 'positive') {
    return '+';
  }
  if (res.change.sign === 'negative') {
    return '-';
  }
  return '';
};

const getColor = (res: SummaryData, isBg = false): string => {
  if (res.change.sign === 'positive') {
    return isBg ? 'bg-success-light' : 'text-success-light';
  }
  if (res.change.sign === 'negative') {
    return isBg ? 'bg-destructive-light' : 'text-destructive-light';
  }
  return isBg ? 'bg-neutral-light' : 'text-neutral-light';
};
