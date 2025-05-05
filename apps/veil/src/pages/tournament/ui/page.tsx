'use client';

import { PenumbraWaves } from '@/pages/explore/ui/waves';
import { DelegatorRewards } from './delegator-rewards';
import { LandingCard } from './landing-card';
import { DelegatorLeaderboard } from './delegator-leaderboard';
import { PreviousEpochs } from './previous-epochs';

export const TournamentPage = () => {
  return (
    <section className='flex flex-col gap-6 p-4 max-w-[1168px] mx-auto'>
      <PenumbraWaves />
      <LandingCard />
      <DelegatorRewards />

      <DelegatorLeaderboard />
      <PreviousEpochs />
    </section>
  );
};
