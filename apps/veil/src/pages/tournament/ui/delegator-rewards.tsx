'use client';

import { useState, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { SegmentedControl } from '@penumbra-zone/ui/SegmentedControl';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { getAmount } from '@penumbra-zone/getters/value-view';
import { Skeleton } from '@penumbra-zone/ui/Skeleton';
import { isZero } from '@penumbra-zone/types/amount';
import { Density } from '@penumbra-zone/ui/Density';
import { Tooltip } from '@penumbra-zone/ui/Tooltip';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { connectionStore } from '@/shared/model/connection';
import { LpRewards } from './lp-rewards';
import { VotingRewards } from './total-delegator-rewards';
import { useCurrentEpoch } from '../api/use-current-epoch';
import { useLpRewards } from '../api/use-lp-rewards';
import { usePersonalRewards } from '../api/use-personal-rewards';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { pnum } from '@penumbra-zone/types/pnum';
import { useStakingTokenMetadata } from '@/shared/api/registry';

// Outer component that handles the connection check. If the wallet isn't connected,
// the parent hook won't execute, and the component won't render.
export const DelegatorRewards = observer(() => {
  if (!connectionStore.connected) {
    return null;
  }

  return <DelegatorTotalRewards />;
});

export const DelegatorTotalRewards = observer(() => {
  const { subaccount } = connectionStore;

  const { epoch, isLoading: epochLoading } = useCurrentEpoch();
  const { data: lpRewards, isLoading: isLpRewardsLoading } = useLpRewards(
    subaccount,
    0,
    Infinity,
    'rewards',
    'desc',
  );

  const {
    totalRewards,
    query: { isLoading: isRewardsLoading, status: rewardsStatus },
  } = usePersonalRewards(subaccount, epoch, epochLoading);

  const { data: stakingToken, isLoading: isTokenLoading } = useStakingTokenMetadata();

  const [parent] = useAutoAnimate();
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded(prev => !prev);
  const [tab, setTab] = useState<'lp' | 'voting'>('lp');

  // Check if we have all the data needed to display rewards
  const isLoading = isLpRewardsLoading || isRewardsLoading || isTokenLoading;
  const isReady =
    !isLoading && lpRewards?.totalRewards !== undefined && rewardsStatus === 'success';

  // Memoize the reward view to prevent unnecessary recalculations
  const rewardView = useMemo(() => {
    if (!isReady) {
      return undefined;
    }

    const rewardsValue = typeof totalRewards === 'number' ? totalRewards : 0;

    return new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: {
          amount: pnum(lpRewards.totalRewards + rewardsValue).toAmount(),
          metadata: stakingToken,
        },
      },
    });
  }, [isReady, lpRewards?.totalRewards, totalRewards, stakingToken]);

  // Only check for zero when we have valid data
  const isTotalZero = !rewardView || isZero(getAmount(rewardView));

  // Close expanded panel if rewards are zero
  useEffect(() => {
    if (isTotalZero && expanded) {
      setExpanded(false);
    }
  }, [isTotalZero, expanded]);

  return (
    <section ref={parent} className='rounded-lg bg-other-tonal-fill5 p-6 backdrop-blur-lg'>
      <div className='flex flex-col items-start justify-between gap-2 desktop:flex-row desktop:items-center'>
        <div className='flex flex-col gap-1'>
          <Text xxl color='text.primary'>
            My Total Tournament Rewards
          </Text>
          <Text small color='text.secondary'>
            Cumulative rewards from all epochs, voting and LPs rewards
          </Text>
        </div>

        {!isReady ? (
          <div className='h-10 w-24'>
            <Skeleton />
          </div>
        ) : (
          <div className='flex w-full items-center justify-between gap-4 desktop:w-auto desktop:[&_span]:text-3xl [&_span]:font-mono'>
            {rewardView && !isTotalZero ? (
              <Density sparse>
                <ValueViewComponent valueView={rewardView} priority='tertiary' />
              </Density>
            ) : (
              <Tooltip message='Participate in the tournament to earn rewards'>
                <Text xxl color='text.primary'>
                  0.00 UM
                </Text>
              </Tooltip>
            )}
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

      {expanded && isReady && !isTotalZero && (
        <div className='mt-4 flex flex-col gap-4'>
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
