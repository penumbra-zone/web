'use client';

import { PenumbraWaves } from '@/pages/explore/ui/waves';
import { MyRewards } from './my-rewards';
import { LandingCard } from './landing-card';

export const TournamentPage = () => {
  return (
    <section className='flex flex-col gap-6 p-4 max-w-[1062px] mx-auto'>
      <PenumbraWaves />
      <LandingCard />
      <MyRewards />
    </section>
  );
};
