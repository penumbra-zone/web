'use client';

import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { SegmentedControl } from '@penumbra-zone/ui/SegmentedControl';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { getAmount } from '@penumbra-zone/getters/value-view';
import { Skeleton } from '@penumbra-zone/ui/Skeleton';
import { isZero } from '@penumbra-zone/types/amount';
import { Density } from '@penumbra-zone/ui/Density';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { connectionStore } from '@/shared/model/connection';
import { LpRewards } from './lp-rewards';
import { VotingRewards } from './voting-rewards';
import { useCurrentEpoch } from '../api/use-current-epoch';
import { usePersonalRewards } from '../api/use-personal-rewards';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { pnum } from '@penumbra-zone/types/pnum';
import { useStakingTokenMetadata } from '@/shared/api/registry';

export const MyRewards = observer(() => {
  const { connected, subaccount } = connectionStore;

  const { epoch } = useCurrentEpoch();
  const { data: total, isLoading } = usePersonalRewards(subaccount, epoch);
  const { data: stakingToken } = useStakingTokenMetadata();

  const [parent] = useAutoAnimate();
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded(prev => !prev);

  const [tab, setTab] = useState<'lp' | 'voting'>('lp');

  if (!connected) {
    return null;
  }

  const rewardView = new ValueView({
    valueView: {
      case: 'knownAssetId',
      value: {
        amount: pnum(total?.totalRewards).toAmount(),
        metadata: stakingToken,
      },
    },
  });

  const isTotalZero = total ? isZero(getAmount(rewardView)) : true;

  return (
    <section ref={parent} className='p-6 rounded-lg bg-other-tonalFill5 backdrop-blur-lg'>
      <div className='flex justify-between items-center'>
        <div className='flex flex-col gap-1'>
          <Text xxl color='text.primary'>
            My Total Rewards
          </Text>
          <Text small color='text.secondary'>
            Cumulative rewards from all epochs, voting and LPs rewards
          </Text>
        </div>

        {isLoading || !total ? (
          <div className='w-24 h-10'>
            <Skeleton />
          </div>
        ) : (
          <div className='flex items-center gap-4 [&_span]:font-mono [&_span]:text-3xl'>
            <Density sparse>
              <ValueViewComponent valueView={rewardView} priority='tertiary' />
            </Density>

            <Density compact>
              {!isTotalZero && (
                <Button
                  iconOnly
                  priority='primary'
                  icon={expanded ? ChevronUp : ChevronDown}
                  onClick={toggleExpanded}
                >
                  Show reward details
                </Button>
              )}
            </Density>
          </div>
        )}
      </div>

      {expanded && (
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
      )}
    </section>
  );
});
