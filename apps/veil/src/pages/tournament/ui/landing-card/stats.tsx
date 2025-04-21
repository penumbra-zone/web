import { Text } from '@penumbra-zone/ui/Text';
import { Skeleton } from '@penumbra-zone/ui/Skeleton';
import { openToast } from '@penumbra-zone/ui/Toast';
import { useCurrentEpoch } from '../../api/use-current-epoch';
import { useTournamentSummary } from '../../api/use-tournament-summary';
import { useEpochGauge } from '../../api/use-epoch-gauge';
import { IncentivePool } from './incentive-pool';
import { TournamentResults } from './results';

export const Stats = () => {
  const { data: stats, isLoading } = useTournamentSummary({
    limit: 1,
    page: 1,
  });

  const { epoch, isLoading: epochLoading } = useCurrentEpoch(newEpoch => {
    openToast({
      type: 'info',
      message: `New epoch has started: ${newEpoch}. Vote for your favorite asset!`,
    });
  });

  const { data: epochGauge, isLoading: epochGaugeLoading, isPending } = useEpochGauge(epoch);

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
      <TournamentResults results={epochGauge ?? []} loading={isPending || epochGaugeLoading} />
    </>
  );
};
