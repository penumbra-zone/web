import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { Skeleton } from '@penumbra-zone/ui/Skeleton';
import { Icon } from '@penumbra-zone/ui/Icon';
import { Text } from '@penumbra-zone/ui/Text';
import { PagePath } from '@/shared/const/pages';
import { useTournamentSummary } from '../../api/use-tournament-summary';
import { useCurrentEpoch } from '../../api/use-current-epoch';
import { IncentivePool } from '../landing-card/incentive-pool';
import { GradientCard } from '../shared/gradient-card';
import { VotingInfo } from '../voting-info';
import { formatTimeRemaining } from '@/shared/utils/format-time';
import { useEffect, useRef } from 'react';
import { LqtSummary } from '@/shared/database/schema';
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
  const { epoch: currentEpoch, isLoading: epochLoading } = useCurrentEpoch();
  const ended = !!currentEpoch && !!epoch && epoch !== currentEpoch;
  const initialDataRef = useRef<LqtSummary[] | null>(null);

  const { data: currentSummary, isLoading } = useTournamentSummary(
    {
      limit: 1,
      page: 1,
    },
    epochLoading || ended,
  );

  useEffect(() => {
    if (!isLoading && currentSummary && !initialDataRef.current) {
      initialDataRef.current = currentSummary;
    }
  }, [isLoading, currentSummary]);

  const summary = ended && initialDataRef.current ? initialDataRef.current : currentSummary;

  const { subaccount } = connectionStore;
  const { data: rewards } = usePersonalRewards(subaccount, currentEpoch, false, 1, 1);
  const latestReward = rewards.values().next().value as LqtDelegatorHistoryData | undefined;

  // We want to pass the most recent epoch with rewards to trigger the social card dialogue.
  const { isOpen: showSocial, close: hideSocial } = useTournamentSocialCard(latestReward?.epoch);

  return (
    <>
      <GradientCard>
        <div className='flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-12 p-4 md:p-6 lg:p-12'>
          <div className='flex flex-col w-full md:w-1/2 gap-6'>
            <div className='flex justify-between items-center'>
              <div className='flex gap-4 items-center'>
                <Link href={PagePath.Tournament}>
                  <button className='w-8 h-8 rounded-full bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)] flex items-center justify-center transition-colors duration-200'>
                    <Icon IconComponent={ArrowLeft} size='sm' color='primary.contrast' />
                  </button>
                </Link>
                <div className='font-heading text-text4xl font-medium leading-text4xl text-transparent bg-clip-text [background-image:linear-gradient(90deg,rgb(244,156,67),rgb(83,174,168))]'>
                  Epoch #{epoch}
                </div>
              </div>

              {ended && (
                <Text technical color='text.secondary'>
                  Ended
                </Text>
              )}

              {!ended && summary?.[0]?.ends_in_s && (
                <Text technical color='text.primary'>
                  Ends in {formatTimeRemaining(summary[0].ends_in_s)}
                </Text>
              )}
            </div>
            <div className='flex gap-6'>
              <div className='flex w-1/2 flex-col items-center gap-2 bg-[rgba(250,250,250,0.05)] rounded-md p-3'>
                {isLoading ? (
                  <div className='w-16 h-5'>
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
              <div className='flex w-1/2 flex-col items-center gap-2 bg-[rgba(250,250,250,0.05)] rounded-md p-3'>
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

          <div className='w-full h-[1px] md:w-[1px] md:h-auto bg-other-tonalStroke flex-shrink-0' />
          <div className='flex flex-col w-full md:w-1/2 md:justify-between gap-6 md:gap-0'>
            <Text variant='h4' color='text.primary'>
              {ended ? 'This Epoch is Ended' : 'Cast Your Vote'}
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
