'use client';

import { PenumbraWaves } from '@/pages/explore/ui/waves';
import { MyRewards } from './my-rewards';
import { LandingCard } from './landing-card';
import { DelegatorLeaderboard } from './delegator-leaderboard';
import { PreviousEpochs } from './previous-epochs';

export const TournamentPage = () => {
  return (
    <section className='flex flex-col gap-6 p-4 max-w-[1062px] mx-auto'>
      <PenumbraWaves />
      <LandingCard />
      <MyRewards />

      <DelegatorLeaderboard />
      <PreviousEpochs />
    </section>
  );
};
