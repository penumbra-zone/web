import { observer } from 'mobx-react-lite';
import { Text } from '@penumbra-zone/ui/Text';
import { Skeleton } from '@penumbra-zone/ui/Skeleton';
import { openToast } from '@penumbra-zone/ui/Toast';
import { useCurrentEpoch } from '../../api/use-current-epoch';
import { useTournamentSummary } from '../../api/use-tournament-summary';
import { useEpochResults } from '../../api/use-epoch-results';
import { GradientCard } from '../shared/gradient-card';
import { VotingInfo } from '../voting-info';
import { IncentivePool } from './incentive-pool';
import { TournamentResults } from './results';
import { Explainer } from './explainer';
import {
  SocialCardDialog,
  useTournamentSocialCard,
} from '@/pages/tournament/ui/social-card-dialog';

export const LandingCard = observer(() => {
  const { data: summary, isLoading: summaryLoading } = useTournamentSummary({
    limit: 1,
    page: 1,
  });

  const { epoch, isLoading: epochLoading } = useCurrentEpoch(newEpoch => {
    openToast({
      type: 'info',
      message: `New epoch has started: ${newEpoch}. Vote for your favorite asset!`,
    });
  });

  const {
    assetGauges,
    isLoading: epochGaugeLoading,
    isPending,
  } = useEpochResults(
    'epoch-results-landing',
    {
      epoch,
      limit: 5,
      page: 1,
    },
    epochLoading,
  );

  const { isOpen: showSocial, close: hideSocial } = useTournamentSocialCard();

  return (
    <>
      <GradientCard>
        <div className='flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-12 p-4 md:p-6 lg:p-12'>
          <Explainer />

          <div className='w-full h-[1px] md:w-[1px] md:h-auto bg-other-tonalStroke flex-shrink-0' />

          <div className='flex flex-col w-full md:w-1/2 gap-8'>
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

            <IncentivePool summary={summary?.[0]} loading={summaryLoading} />
            <TournamentResults
              results={assetGauges.slice(0, 5)}
              loading={isPending || epochGaugeLoading}
            />
            <VotingInfo />
          </div>
        </div>
      </GradientCard>

      {showSocial && epoch && <SocialCardDialog epoch={epoch} onClose={hideSocial} />}
    </>
  );
});
