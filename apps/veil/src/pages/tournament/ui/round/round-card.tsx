import Link from 'next/link';
import { observer } from 'mobx-react-lite';
import { GradientCard } from '../shared/gradient-card';
import { Icon } from '@penumbra-zone/ui/Icon';
import { Text } from '@penumbra-zone/ui/Text';
import { ArrowLeft } from 'lucide-react';
import { PagePath } from '@/shared/const/pages';
import { useTournamentSummary } from '../../api/use-tournament-summary';
import { IncentivePool } from '../landing-card/incentive-pool';
import { VotingInfo } from '../voting-info';

export interface RoundCardProps {
  epoch: number;
}

export const RoundCard = observer(({ epoch }: RoundCardProps) => {
  const { data: summary, isLoading } = useTournamentSummary({
    limit: 1,
    page: 1,
    epoch,
  });

  const startBlock = 123;
  const endBlock = 123;
  const ended = false as boolean;

  return (
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
            <div className='flex gap-2'>
              <Text technical color='text.primary'>
                Ends in ~12h
              </Text>
            </div>
          </div>
          <div className='flex gap-6'>
            <div className='flex w-1/2 flex-col items-center gap-2 bg-[rgba(250,250,250,0.05)] rounded-md p-3'>
              <Text smallTechnical color='text.primary'>
                {startBlock}
              </Text>
              <Text detailTechnical color='text.secondary'>
                Start Block
              </Text>
            </div>
            <div className='flex w-1/2 flex-col items-center gap-2 bg-[rgba(250,250,250,0.05)] rounded-md p-3'>
              <Text smallTechnical color='text.primary'>
                {endBlock}
              </Text>
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
          <VotingInfo />
        </div>
      </div>
    </GradientCard>
  );
});
