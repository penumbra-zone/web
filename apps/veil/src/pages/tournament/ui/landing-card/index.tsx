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
import { formatTimeRemaining } from '@/shared/utils/format-time';
import { addSeconds, format } from 'date-fns';
import { Tooltip } from '@penumbra-zone/ui/Tooltip';
import { Hourglass } from 'lucide-react';

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

  const { isOpen: showSocial, close: hideSocial } = useTournamentSocialCard(latestReward?.epoch);
  const epochEndsIn = summary?.[0]?.ends_in_s;
  const endingTime = epochEndsIn
    ? format(addSeconds(new Date(), epochEndsIn), 'MMM d, yyyy, hh:mm aa OOO')
    : undefined;

  return (
    <>
      <GradientCard>
        <div className='flex flex-col gap-4 p-4 lg:gap-12 lg:p-12 md:flex-row md:gap-6 md:p-6'>
          <Explainer />

          <div className='h-px w-full shrink-0 bg-other-tonal-stroke md:h-auto md:w-px' />

          <div className='flex w-full flex-col gap-8 md:w-1/2'>
            <div className='flex items-center justify-between'>
              {epochLoading ? (
                <Skeleton />
              ) : (
                <Text variant='h3' color='text.primary'>
                  <span className='bg-gradient-to-r from-orange-400 to-teal-400 bg-clip-text text-transparent'>
                    <span>Current Epoch </span>#{epoch}
                  </span>
                </Text>
              )}

              {epochEndsIn && epochEndsIn <= 0 ? (
                <Text technical color='text.secondary'>
                  Ended
                </Text>
              ) : (
                typeof epochEndsIn === 'number' && (
                  <Tooltip message={endingTime}>
                    <div className='flex items-center gap-2'>
                      <Hourglass className='h-5 w-5 text-white/80' />
                      <Text>Ends in {formatTimeRemaining(epochEndsIn)}</Text>
                    </div>
                  </Tooltip>
                )
              )}
            </div>

            <IncentivePool summary={summary?.[0]} loading={summaryLoading} />
            <TournamentResults
              results={assetGauges.slice(0, 5)}
              loading={isPending || epochGaugeLoading}
            />
            <VotingInfo epoch={epoch} identifier='landing-card' />
          </div>
        </div>
      </GradientCard>

      {showSocial && latestReward?.epoch && (
        <SocialCardDialog epoch={latestReward.epoch} onClose={hideSocial} />
      )}
    </>
  );
});
