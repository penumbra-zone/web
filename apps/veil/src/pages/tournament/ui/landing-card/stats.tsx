import Image from 'next/image';
import { Text } from '@penumbra-zone/ui/Text';
import { round } from '@penumbra-zone/types/round';
import { Skeleton } from '@penumbra-zone/ui/Skeleton';
import { useCurrentEpoch } from '../../api/use-current-epoch';
import { useTournamentSummary } from '../../api/use-tournament-summary';
import { IncentivePool } from './incentive-pool';

export const Stats = ({
  poolAmount,
  results,
}: {
  poolAmount: number;
  poolLPs: number;
  poolDelegators: number;
  symbol: string;
  results: { symbol: string; amount: number; imgUrl: string }[];
}) => {
  const { epoch, isLoading: epochLoading } = useCurrentEpoch();
  const { data: stats, isLoading } = useTournamentSummary({
    limit: 1,
    page: 1,
  });

  return (
    <>
      <div className='flex justify-between'>
        <Text variant='h3' color='text.primary'>
          Current Epoch
        </Text>
        <div className='flex items-center rounded-sm bg-base-blackAlt px-2'>
          {epochLoading ? (
            <div className='w-16 h-6'>
              <Skeleton />
            </div>
          ) : (
            <div className='text-transparent bg-clip-text [background-image:linear-gradient(90deg,rgb(244,156,67),rgb(83,174,168))]'>
              <Text xxl>#{epoch}</Text>
            </div>
          )}
        </div>
      </div>

      <IncentivePool summary={stats?.[0]} loading={isLoading} />

      <div className='flex flex-col gap-4'>
        <Text strong color='text.primary'>
          Current Results
        </Text>
        {results.map(asset => (
          <div key={asset.symbol} className='flex gap-3'>
            <Image src={asset.imgUrl} alt={asset.symbol} width={32} height={32} />
            <div className='flex w-full flex-col gap-2'>
              <div className='flex justify-between w-full'>
                <Text technical color='text.primary'>
                  {asset.symbol}
                </Text>
                <Text technical color='text.secondary'>
                  {round({ value: (asset.amount / poolAmount) * 100, decimals: 0 })}%
                </Text>
              </div>
              <div className='flex w-full h-[6px] bg-other-tonalFill5 rounded-full'>
                <div
                  className='h-[6px] bg-secondary-light rounded-full'
                  style={{ width: `calc(${(asset.amount / poolAmount) * 100}% - 1px)` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
