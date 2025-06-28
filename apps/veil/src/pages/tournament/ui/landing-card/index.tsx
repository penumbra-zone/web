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
import { connectionStore } from '@/shared/model/connection';
import { usePersonalRewards } from '../../api/use-personal-rewards';
import { LqtDelegatorHistoryData } from '../../server/delegator-history';

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

  const { subaccount } = connectionStore;
  const { data: rewards } = usePersonalRewards(subaccount, epoch, false, 1, 1);
  const latestReward = rewards.values().next().value as LqtDelegatorHistoryData | undefined;

  // We want to pass the most recent epoch with rewards to trigger the social card dialogue.
  const { isOpen: showSocial, close: hideSocial } = useTournamentSocialCard(latestReward?.epoch);

  const nonZeroGauges = assetGauges.filter(g => g.votes > 0);

  return (
    <>
      <GradientCard>
        <div className='flex flex-col gap-4 p-4 lg:gap-12 lg:p-12 md:flex-row md:gap-6 md:p-6'>
          <Explainer />

          <div className='h-px w-full shrink-0 bg-other-tonal-stroke md:h-auto md:w-px' />

          <div className='flex w-full flex-col gap-8 md:w-1/2'>
            <div className='flex justify-between'>
              <Text variant='h3' color='text.primary'>
                Current Epoch
              </Text>
              <div className='flex items-center rounded-sm bg-base-black-alt px-2'>
                {epochLoading ? (
                  <div className='h-6 w-16'>
                    <Skeleton />
                  </div>
                ) : (
                  <div className='bg-[linear-gradient(90deg,rgb(244,156,67),rgb(83,174,168))] bg-clip-text text-transparent'>
                    <Text xxl>#{epoch}</Text>
                  </div>
                )}
              </div>
            </div>

            <IncentivePool summary={summary?.[0]} loading={summaryLoading} />
            {nonZeroGauges.length > 0 && (
              <TournamentResults
                results={nonZeroGauges.slice(0, 5)}
                loading={isPending || epochGaugeLoading}
              />
            )}
            <VotingInfo />
          </div>
        </div>
      </GradientCard>

      {showSocial && latestReward?.epoch && (
        <SocialCardDialog epoch={latestReward.epoch} onClose={hideSocial} />
      )}
    </>
  );
});
