import { useState } from 'react';
import { Text } from '@penumbra-zone/ui/Text';
import { Skeleton } from '@penumbra-zone/ui/Skeleton';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { SegmentedControl } from '@penumbra-zone/ui/SegmentedControl';
import { Density } from '@penumbra-zone/ui/Density';
import { useTotalRewards } from '../../api/use-total-rewards';
import { LpRewards } from '../lp-rewards';
import { VotingRewards } from '../total-delegator-rewards';

export const DelegatorRewards = () => {
  const { data: total, isLoading } = useTotalRewards();

  const [tab, setTab] = useState<'lp' | 'voting'>('lp');

  return (
    <div className='flex flex-col gap-4 p-6 rounded-lg bg-other-tonalFill5 backdrop-blur-lg'>
      <div className='flex justify-between items-center'>
        <div className='flex flex-col gap-1'>
          <Text xxl color='text.primary'>
            Total Rewards Earned
          </Text>
          <Text small color='text.secondary'>
            Cumulative from all epochs, voting and LPs rewards
          </Text>
        </div>

        {isLoading || !total ? (
          <div className='w-24 h-10'>
            <Skeleton />
          </div>
        ) : (
          <div className='flex items-center gap-4 [&_span]:font-mono [&_span]:text-3xl'>
            <Density sparse>
              <ValueViewComponent valueView={total} priority='tertiary' />
            </Density>
          </div>
        )}
      </div>

      <div className='flex flex-col gap-4 mt-4'>
        <div className='[&_button]:grow'>
          <SegmentedControl value={tab} onChange={value => setTab(value as typeof tab)}>
            <SegmentedControl.Item style='filled' value='lp'>
              LPs Rewards
            </SegmentedControl.Item>
            <SegmentedControl.Item style='filled' value='voting'>
              Voting Rewards
            </SegmentedControl.Item>
          </SegmentedControl>
        </div>

        {tab === 'lp' && <LpRewards />}

        {tab === 'voting' && <VotingRewards />}
      </div>
    </div>
  );
};
