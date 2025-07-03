import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { addSeconds, format } from 'date-fns';
import { Skeleton } from '@penumbra-zone/ui/Skeleton';
import { Icon } from '@penumbra-zone/ui/Icon';
import { Text } from '@penumbra-zone/ui/Text';
import { Tooltip } from '@penumbra-zone/ui/Tooltip';
import { PagePath } from '@/shared/const/pages';
import { useTournamentSummary } from '../../api/use-tournament-summary';
import { useCurrentEpoch } from '../../api/use-current-epoch';
import { IncentivePool } from '../landing-card/incentive-pool';
import { GradientCard } from '../shared/gradient-card';
import { VotingInfo } from '../voting-info';
import { formatTimeRemaining } from '@/shared/utils/format-time';
import { useRef } from 'react';
import {
  SocialCardDialog,
  useTournamentSocialCard,
} from '@/pages/tournament/ui/social-card-dialog';
import { usePersonalRewards } from '../../api/use-personal-rewards';
import { connectionStore } from '@/shared/model/connection';
import type { LqtDelegatorHistoryData } from '../../server/delegator-history';

export interface RoundCardProps {
  epoch: number;
}

export const RoundCard = observer(({ epoch }: RoundCardProps) => {
  // prevents the card from jumping to a newer epoch
  const initialEpoch = useRef(epoch);

  const { epoch: currentEpoch } = useCurrentEpoch();
  const ended = !!currentEpoch && !!epoch && epoch !== currentEpoch;

  const { data: summary, isLoading } = useTournamentSummary(
    {
      epochs: [initialEpoch.current],
      limit: 1,
      page: 1,
    },
    ended,
  );

  const endingTime = summary?.[0]?.ends_in_s
    ? format(addSeconds(new Date(), summary[0].ends_in_s), 'MMM d, yyyy, hh:mm aa OOO')
    : undefined;

  const { subaccount } = connectionStore;
  const { data: rewards } = usePersonalRewards(subaccount, currentEpoch, false, 1, 1);
  const latestReward = rewards.values().next().value as LqtDelegatorHistoryData | undefined;

  // We want to pass the most recent epoch with rewards to trigger the social card dialogue.
  const { isOpen: showSocial, close: hideSocial } = useTournamentSocialCard(latestReward?.epoch);

  return (
    <>
      <GradientCard>
        <div className='flex flex-col gap-4 p-4 lg:gap-12 lg:p-12 md:flex-row md:gap-6 md:p-6'>
          <div className='flex w-full flex-col gap-6 md:w-1/2'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <Link href={PagePath.Tournament}>
                  <button className='flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(255,255,255,0.1)] transition-colors duration-200 hover:bg-[rgba(255,255,255,0.15)]'>
                    <Icon IconComponent={ArrowLeft} size='sm' color='primary.contrast' />
                  </button>
                </Link>
                <div className='bg-[linear-gradient(90deg,rgb(244,156,67),rgb(83,174,168))] bg-clip-text font-heading text-text4xl leading-text4xl font-medium text-transparent'>
                  Epoch #{epoch}
                </div>
              </div>

              {ended && (
                <Text technical color='text.secondary'>
                  Ended
                </Text>
              )}

              {!ended && summary?.[0]?.ends_in_s && (
                <Tooltip message={endingTime}>
                  <Text technical color='text.primary'>
                    Ends in {formatTimeRemaining(summary[0].ends_in_s)}
                  </Text>
                </Tooltip>
              )}
            </div>
            <div className='flex gap-6'>
              <div className='flex w-1/2 flex-col items-center gap-2 rounded-md bg-[rgba(250,250,250,0.05)] p-3'>
                {isLoading ? (
                  <div className='h-5 w-16'>
                    <Skeleton />
                  </div>
                ) : (
                  <Text smallTechnical color='text.primary'>
                    {summary?.[0]?.start_block}
                  </Text>
                )}

                <Text detailTechnical color='text.secondary'>
                  Start Block
                </Text>
              </div>
              <div className='flex w-1/2 flex-col items-center gap-2 rounded-md bg-[rgba(250,250,250,0.05)] p-3'>
                {isLoading ? (
                  <div className='h-5 w-16'>
                    <Skeleton />
                  </div>
                ) : (
                  <Text smallTechnical color='text.primary'>
                    {summary?.[0]?.end_block}
                  </Text>
                )}

                <Text detailTechnical color='text.secondary'>
                  End Block
                </Text>
              </div>
            </div>

            <IncentivePool summary={summary?.[0]} loading={isLoading} />
          </div>

          <div className='h-px w-full shrink-0 bg-other-tonal-stroke md:h-auto md:w-px' />
          <div className='flex w-full flex-col gap-6 md:w-1/2 md:justify-between md:gap-0'>
            <Text variant='h4' color='text.primary'>
              {ended ? 'This Epoch has Ended' : 'Cast Your Vote'}
            </Text>
            <VotingInfo epoch={epoch} />
          </div>
        </div>
      </GradientCard>

      {showSocial && latestReward?.epoch && (
        <SocialCardDialog epoch={latestReward.epoch} onClose={hideSocial} />
      )}
    </>
  );
});
